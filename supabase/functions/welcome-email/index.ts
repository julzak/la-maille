import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "jzakoian@gmail.com";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    email: string;
    username: string;
    created_at: string;
  };
  old_record: null | {
    id: string;
    email: string;
    username: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const payload: WebhookPayload = await req.json();

    // Only send welcome email on new profile creation
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Not an insert, skipping" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, username } = payload.record;

    const emailHtml = `
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

      <h2 style="font-size: 22px; color: #1a1a1a; margin-bottom: 16px; text-align: center;">
        Bienvenue ${username} !
      </h2>

      <p style="color: #444; line-height: 1.7; margin-bottom: 20px; text-align: center;">
        Votre compte La Maille est prêt. Vous pouvez maintenant transformer n'importe quelle photo de tricot en patron personnalisé.
      </p>

      <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="font-size: 14px; color: #1a1a1a; margin: 0 0 12px; font-weight: 600;">Comment ça marche :</h3>
        <ol style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
          <li>Uploadez une photo d'un tricot que vous aimez</li>
          <li>La Maille analyse la construction et les détails</li>
          <li>Entrez vos mesures et votre échantillon</li>
          <li>Recevez votre patron personnalisé !</li>
        </ol>
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="https://la-maille.com" style="display: inline-block; background: #1a1a1a; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
          Créer mon premier patron
        </a>
      </div>

      <p style="color: #888; font-size: 13px; margin-top: 32px; text-align: center; line-height: 1.6;">
        Des questions ? Répondez simplement à cet email.<br>
        Bon tricot !
      </p>

    </div>

    <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">
      La Maille · Paris, France
    </p>
  </div>
</body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "La Maille <hello@la-maille.com>",
        to: [email],
        subject: `Bienvenue sur La Maille, ${username} !`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send notification to admin
    const adminNotificationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; padding: 24px;">
    <h2 style="margin: 0 0 16px; color: #1a1a1a;">🧶 Nouveau compte La Maille</h2>
    <p style="color: #444; line-height: 1.6; margin: 0 0 12px;">
      <strong>Pseudo :</strong> ${username}<br>
      <strong>Email :</strong> ${email}<br>
      <strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
    </p>
  </div>
</body>
</html>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "La Maille <hello@la-maille.com>",
        to: [ADMIN_EMAIL],
        subject: `🧶 Nouveau compte : ${username}`,
        html: adminNotificationHtml,
      }),
    });

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
