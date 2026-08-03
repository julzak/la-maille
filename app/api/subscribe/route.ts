import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validate-email";

/**
 * BRIEF-01 - capture email au moment de valeur (export PDF / impression).
 *
 * Upsert le contact dans Brevo (liste "la-maille-audience", creee si absente)
 * avec ses attributs. Ne bloque JAMAIS le deverrouillage cote client si
 * Brevo est indisponible ou mal configure : seule une adresse invalide est
 * rejetee (400). Toute erreur Brevo est loggee puis avalee (fail-open).
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_BASE = "https://api.brevo.com/v3";
const BREVO_LIST_NAME = "la-maille-audience";

interface BrevoList {
  id: number;
  name: string;
}

interface BrevoFolder {
  id: number;
}

interface BrevoAttribute {
  name: string;
}

const CUSTOM_ATTRIBUTES: Array<{ name: string; type: "text" | "boolean" }> = [
  { name: "LANGUE", type: "text" },
  { name: "GARMENT_TYPE", type: "text" },
  { name: "NEWSLETTER_OPT_IN", type: "boolean" },
  { name: "SOURCE", type: "text" },
];

// Caches en memoire, reutilises tant que l'instance serverless reste chaude :
// evite de re-chercher/creer la liste et les attributs a chaque requete.
let cachedListId: number | null = null;
let attributesEnsured = false;

async function ensureCustomAttributesExist(): Promise<void> {
  if (attributesEnsured || !BREVO_API_KEY) return;

  const res = await fetch(`${BREVO_API_BASE}/contacts/attributes`, {
    headers: { "api-key": BREVO_API_KEY },
  });
  if (!res.ok) return;

  const data = (await res.json()) as { attributes?: BrevoAttribute[] };
  const existingNames = new Set((data.attributes || []).map((a) => a.name));

  await Promise.all(
    CUSTOM_ATTRIBUTES.filter((attr) => !existingNames.has(attr.name)).map(
      (attr) =>
        fetch(
          `${BREVO_API_BASE}/contacts/attributes/normal/${attr.name}`,
          {
            method: "POST",
            headers: {
              "api-key": BREVO_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: attr.type }),
          }
        ).catch(() => null)
    )
  );

  attributesEnsured = true;
}

async function getOrCreateListId(): Promise<number | null> {
  if (cachedListId) return cachedListId;
  if (!BREVO_API_KEY) return null;

  const listsRes = await fetch(
    `${BREVO_API_BASE}/contacts/lists?limit=50&offset=0`,
    { headers: { "api-key": BREVO_API_KEY } }
  );
  if (listsRes.ok) {
    const listsData = (await listsRes.json()) as { lists?: BrevoList[] };
    const existing = (listsData.lists || []).find(
      (l) => l.name === BREVO_LIST_NAME
    );
    if (existing) {
      cachedListId = existing.id;
      return cachedListId;
    }
  }

  // Pas de liste : il faut un dossier pour en creer une.
  let folderId: number | null = null;
  const foldersRes = await fetch(
    `${BREVO_API_BASE}/contacts/folders?limit=50&offset=0`,
    { headers: { "api-key": BREVO_API_KEY } }
  );
  if (foldersRes.ok) {
    const foldersData = (await foldersRes.json()) as {
      folders?: BrevoFolder[];
    };
    folderId = foldersData.folders?.[0]?.id ?? null;
  }
  if (!folderId) {
    const createFolderRes = await fetch(`${BREVO_API_BASE}/contacts/folders`, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "La Maille" }),
    });
    if (createFolderRes.ok) {
      const created = (await createFolderRes.json()) as { id: number };
      folderId = created.id;
    }
  }
  if (!folderId) return null;

  const createListRes = await fetch(`${BREVO_API_BASE}/contacts/lists`, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: BREVO_LIST_NAME, folderId }),
  });
  if (!createListRes.ok) return null;

  const createdList = (await createListRes.json()) as { id: number };
  cachedListId = createdList.id;
  return cachedListId;
}

interface SubscribeRequestBody {
  email?: string;
  language?: string;
  garmentType?: string;
  newsletterConsent?: boolean;
}

export async function POST(request: NextRequest) {
  let body: SubscribeRequestBody;
  try {
    body = (await request.json()) as SubscribeRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // A partir d'ici, la reponse est toujours { success: true } : la capture ne
  // doit jamais bloquer l'acces au patron, meme si Brevo est down ou mal
  // configure. On logge et on continue.
  try {
    if (!BREVO_API_KEY) {
      console.error("[subscribe] BREVO_API_KEY absente, contact non synchronise avec Brevo");
      return NextResponse.json({ success: true });
    }

    await ensureCustomAttributesExist().catch((err) =>
      console.error("[subscribe] ensureCustomAttributesExist failed:", err)
    );

    const listId = await getOrCreateListId();

    const contactPayload: Record<string, unknown> = {
      email,
      attributes: {
        LANGUE: body.language === "en" ? "EN" : "FR",
        GARMENT_TYPE: body.garmentType || "unknown",
        NEWSLETTER_OPT_IN: !!body.newsletterConsent,
        SOURCE: "pdf_gate",
      },
      updateEnabled: true,
    };
    if (listId) {
      contactPayload.listIds = [listId];
    }

    const contactRes = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    if (!contactRes.ok) {
      const errData = await contactRes.json().catch(() => null);
      console.error(
        "[subscribe] Brevo contact upsert failed:",
        contactRes.status,
        errData
      );
    }
  } catch (err) {
    console.error("[subscribe] Brevo call failed, deverrouillage quand meme:", err);
  }

  return NextResponse.json({ success: true });
}
