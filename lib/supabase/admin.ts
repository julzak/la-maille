import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase service_role pour les operations serveur qui bypassent la RLS
 * (ex: logging des generations, jobs admin). NE JAMAIS importer cote client.
 * Retourne null si la cle service_role n'est pas configuree (le logging devient
 * best-effort et ne casse pas le flux utilisateur).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
