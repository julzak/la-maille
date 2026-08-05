/**
 * Diagnostic pages patrons publiques (BRIEF-03).
 *
 * A rejouer APRES application de la migration
 * supabase/migrations/20260803_public_patterns.sql sur jazzy-apps :
 *
 *   ./node_modules/.bin/tsx scripts/diag-public-patterns.ts
 *   BASE_URL=http://localhost:3000 ./node_modules/.bin/tsx scripts/diag-public-patterns.ts
 *
 * Verifie :
 *  1. Colonnes is_public / public_slug presentes.
 *  2. RLS : une requete anonyme directe sur saved_patterns ne retourne QUE
 *     les patrons is_public = true (compare avec le comptage service_role).
 *  3. Aucun slug public en double.
 *  4. Si BASE_URL est fourni et qu'un patron public existe : la page rend
 *     200 avec canonical + JSON-LD + og:image, l'OG image rend 200
 *     image/png, un slug inexistant rend 404, le sitemap contient le slug.
 *
 * Lit NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY /
 * SUPABASE_SERVICE_ROLE_KEY depuis l'environnement ou .env.local.
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Chargement minimal de .env.local (pas de dependance dotenv).
try {
  const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=("?)(.*)\2$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[3];
    }
  }
} catch {
  // pas de .env.local : on suppose l'environnement deja configure
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.BASE_URL || null;

let failures = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`OK   - ${label}${detail ? ` (${detail})` : ""}`);
  } else {
    failures++;
    console.error(`FAIL - ${label}${detail ? ` (${detail})` : ""}`);
  }
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY manquants");
    process.exit(1);
  }

  const anon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Colonnes presentes
  const { data: anonRows, error: anonError } = await anon
    .from("saved_patterns")
    .select("id, is_public, public_slug")
    .limit(1000);

  if (anonError?.code === "42703") {
    console.error(
      "FAIL - Colonnes is_public/public_slug absentes : migration 20260803_public_patterns.sql non appliquee"
    );
    process.exit(1);
  }
  check("Colonnes is_public/public_slug presentes", !anonError, anonError?.message);

  // 2. RLS : l'anonyme ne voit QUE les patrons publics
  const rows = anonRows || [];
  const nonPublicVisible = rows.filter((r) => r.is_public !== true);
  check(
    "Requete anonyme : uniquement des patrons is_public = true",
    nonPublicVisible.length === 0,
    `${rows.length} ligne(s) visible(s), ${nonPublicVisible.length} privee(s) => fuite si > 0`
  );

  // 3. Slugs uniques
  const slugs = rows.map((r) => r.public_slug).filter(Boolean) as string[];
  check(
    "Aucun slug public en double",
    new Set(slugs).size === slugs.length,
    `${slugs.length} slug(s)`
  );

  // Comparaison service_role (comptage global) si la cle est disponible
  if (SERVICE_KEY) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { count: totalCount } = await admin
      .from("saved_patterns")
      .select("id", { count: "exact", head: true });
    const { count: publicCount } = await admin
      .from("saved_patterns")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true);

    console.log(
      `INFO - saved_patterns : ${totalCount} total, ${publicCount} public(s), ${rows.length} visible(s) en anonyme`
    );
    check(
      "Anonyme voit exactement le nombre de patrons publics",
      rows.length === (publicCount ?? -1)
    );

    // Requete anonyme ciblee sur un patron PRIVE : doit rendre 0 ligne
    const { data: privateRow } = await admin
      .from("saved_patterns")
      .select("id")
      .eq("is_public", false)
      .limit(1)
      .maybeSingle();

    if (privateRow) {
      const { data: leaked } = await anon
        .from("saved_patterns")
        .select("id")
        .eq("id", privateRow.id);
      check(
        "Requete anonyme sur un patron prive par id : 0 ligne",
        (leaked || []).length === 0
      );
    } else {
      console.log("INFO - Aucun patron prive en DB, test de fuite par id saute");
    }
  } else {
    console.log("INFO - SUPABASE_SERVICE_ROLE_KEY absente, comparaison globale sautee");
  }

  // 4. Verifications HTTP (optionnelles, BASE_URL requis)
  if (BASE_URL) {
    const publicSlug = slugs[0] || null;

    if (publicSlug) {
      const pageRes = await fetch(`${BASE_URL}/patron/p/${publicSlug}`);
      const html = pageRes.ok ? await pageRes.text() : "";
      check(`GET /patron/p/${publicSlug} => 200`, pageRes.status === 200);
      check(
        "HTML : canonical present",
        html.includes(`rel="canonical"`) && html.includes(`/patron/p/${publicSlug}`)
      );
      check("HTML : JSON-LD HowTo present", html.includes('"@type":"HowTo"'));
      check("HTML : og:image present", html.includes('property="og:image"'));
      check(
        "HTML : pas de robots noindex",
        !/name="robots"[^>]*noindex/.test(html)
      );

      const ogRes = await fetch(
        `${BASE_URL}/patron/p/${publicSlug}/opengraph-image`
      );
      check(
        "OG image => 200 image/png",
        ogRes.status === 200 &&
          (ogRes.headers.get("content-type") || "").includes("image/png"),
        `status ${ogRes.status}, type ${ogRes.headers.get("content-type")}`
      );

      const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
      const sitemapXml = sitemapRes.ok ? await sitemapRes.text() : "";
      check(
        "Sitemap contient le slug public",
        sitemapXml.includes(`/patron/p/${publicSlug}`)
      );
    } else {
      console.log("INFO - Aucun patron public : tests HTTP de page sautes");
    }

    const notFoundRes = await fetch(`${BASE_URL}/patron/p/slug-inexistant-000000`);
    check("GET slug inexistant => 404", notFoundRes.status === 404);
  } else {
    console.log("INFO - BASE_URL non fourni, verifications HTTP sautees");
  }

  console.log(failures === 0 ? "\nTOUT EST VERT" : `\n${failures} ECHEC(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Erreur inattendue:", err);
  process.exit(1);
});
