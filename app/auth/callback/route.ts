import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user to create/update profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let isNewUser = false;

      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        isNewUser = !existingProfile;

        if (isNewUser) {
          // Create profile for OAuth users
          const username =
            user.user_metadata?.username ||
            user.user_metadata?.name?.toLowerCase().replace(/\s+/g, "_") ||
            user.email?.split("@")[0] ||
            `user_${user.id.slice(0, 8)}`;

          // Ensure username is unique
          let finalUsername = username;
          let counter = 1;
          while (true) {
            const { data: existing } = await supabase
              .from("profiles")
              .select("username")
              .eq("username", finalUsername)
              .single();

            if (!existing) break;
            finalUsername = `${username}_${counter}`;
            counter++;
          }

          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email!,
            username: finalUsername,
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }
      }

      const redirectUrl = new URL(`${origin}${next}`);
      if (isNewUser) {
        const provider = user?.app_metadata?.provider ?? "google";
        redirectUrl.searchParams.set("signup", provider === "email" ? "email" : "google");
      }
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
