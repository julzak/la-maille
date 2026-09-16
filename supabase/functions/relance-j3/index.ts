import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const RELANCE_J3_ENABLED = Deno.env.get("RELANCE_J3_ENABLED") === "true";

const HOUR_MS = 60 * 60 * 1000;
const WINDOW_MIN_HOURS = 72;
const WINDOW_MAX_HOURS = 96;

type Variant = "a_saved_pattern" | "no_pattern";

interface Recipient {
  id: string;
  email: string;
  variant: Variant;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 3)}***@${domain}`;
}

function emailHtml(variant: Variant): { subject: string; html: string } {
  const isA = variant === "a_saved_pattern";

  const subject = isA
    ? "Your pattern is still there / Votre patron est toujours la"
    : "Turn a photo into a pattern / Transformez une photo en patron";

  const ctaUrlEn = isA ? "https://la-maille.com/mes-patrons" : "https://la-maille.com/";
  const ctaUrlFr = isA ? "https://la-maille.com/mes-patrons" : "https://la-maille.com/fr";

  const ctaLabelEn = isA ? "See your pattern" : "Try it now";
  const ctaLabelFr = isA ? "Voir mon patron" : "Essayer maintenant";

  const bodyEn = isA
    ? "You started a pattern on La Maille a few days ago. It's still saved, right where you left it."
    : "You created an account on La Maille but haven't tried it yet. Send a photo of a sweater you like and get a pattern back.";

  const bodyFr = isA
    ? "Vous avez commence un patron sur La Maille il y a quelques jours. Il est toujours enregistre, la ou vous l'avez laisse."
    : "Vous avez cree un compte sur La Maille mais vous n'avez pas encore essaye. Envoyez la photo d'un pull qui vous plait et recuperez un patron.";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0; letter-spacing: 2px;">LA MAILLE</h1>
        <p style="color: #888; font-size: 14px; margin: 8px 0 0;">De la photo au patron</p>
      </div>

      <p style="color: #444; line-height: 1.7; margin-bottom: 20px;">
        Hi,<br>${bodyEn}
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${ctaUrlEn}" style="display: inline-block; background: #1a1a1a; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
          ${ctaLabelEn}
        </a>
      </div>

      <p style="color: #888; font-size: 13px; margin: 0 0 32px; line-height: 1.6;">
        If you'd rather not get these, just reply to this email.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 32px;">

      <p style="color: #444; line-height: 1.7; margin-bottom: 20px;">
        Bonjour,<br>${bodyFr}
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${ctaUrlFr}" style="display: inline-block; background: #1a1a1a; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
          ${ctaLabelFr}
        </a>
      </div>

      <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
        Pour ne plus recevoir ces emails, repondez simplement a celui-ci.
      </p>

    </div>

    <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">
      La Maille &middot; Paris, France
    </p>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

async function sendBrevoEmail(to: string, variant: Variant): Promise<void> {
  const { subject, html } = emailHtml(variant);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "La Maille", email: "contact@la-maille.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Brevo error (${res.status}): ${JSON.stringify(data)}`);
  }
}

async function listRecentConfirmedUsers(
  supabase: ReturnType<typeof createClient>,
): Promise<{ id: string; email: string }[]> {
  const now = Date.now();
  const windowStart = now - WINDOW_MAX_HOURS * HOUR_MS;
  const windowEnd = now - WINDOW_MIN_HOURS * HOUR_MS;

  const matched: { id: string; email: string }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    for (const user of data.users) {
      if (!user.email || !user.email_confirmed_at) continue;
      const createdAt = new Date(user.created_at).getTime();
      if (createdAt >= windowStart && createdAt <= windowEnd) {
        matched.push({ id: user.id, email: user.email });
      }
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return matched;
}

const handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const candidates = await listRecentConfirmedUsers(supabase);

    // Filtre les users deja relances (kind = 'j3'), quel que soit le mode.
    let alreadySent = new Set<string>();
    if (candidates.length > 0) {
      const { data: already, error: alreadyError } = await supabase
        .from("relance_emails")
        .select("user_id")
        .eq("kind", "j3")
        .in("user_id", candidates.map((c) => c.id));
      if (alreadyError) throw alreadyError;
      alreadySent = new Set((already ?? []).map((r: { user_id: string }) => r.user_id));
    }

    const pending = candidates.filter((c) => !alreadySent.has(c.id));

    const recipients: Recipient[] = [];
    for (const user of pending) {
      const { count, error: patternsError } = await supabase
        .from("saved_patterns")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (patternsError) throw patternsError;

      recipients.push({
        id: user.id,
        email: user.email,
        variant: (count ?? 0) > 0 ? "a_saved_pattern" : "no_pattern",
      });
    }

    if (!RELANCE_J3_ENABLED) {
      console.info(`DRY RUN: ${recipients.length} destinataire(s) auraient recu la relance J3, aucun email envoye.`);
      return new Response(
        JSON.stringify({
          mode: "dry_run",
          enabled: false,
          count: recipients.length,
          recipients: recipients.map((r) => ({
            email_masked: maskEmail(r.email),
            variant: r.variant,
          })),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    let sent = 0;
    let errors = 0;
    for (const recipient of recipients) {
      try {
        await sendBrevoEmail(recipient.email, recipient.variant);

        const { error: insertError } = await supabase.from("relance_emails").insert({
          user_id: recipient.id,
          kind: "j3",
        });
        if (insertError) throw insertError;

        sent += 1;
      } catch (err) {
        errors += 1;
        console.error(`Erreur relance J3 pour ${maskEmail(recipient.email)}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ mode: "live", enabled: true, candidates: recipients.length, sent, errors }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erreur relance-j3:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
