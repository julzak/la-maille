import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ANONYMOUS_DAILY_LIMIT,
  AUTHENTICATED_DAILY_LIMIT,
  RATE_LIMIT_WINDOW_HOURS,
} from "./rate-limit-constants";

export {
  ANONYMOUS_DAILY_LIMIT,
  AUTHENTICATED_DAILY_LIMIT,
  RATE_LIMIT_WINDOW_HOURS,
};

// Longueur du hash tronque (128 bits en hexa) : jamais l'IP en clair, ni en DB ni en logs.
const IP_HASH_LENGTH = 32;

export type RateLimitIdentity =
  | { type: "user"; userId: string }
  | { type: "ip"; ipHash: string }
  | { type: "unknown" }; // pas d'IP exploitable -> fail-open

export interface RateLimitResult {
  limited: boolean;
  limit: number;
}

/**
 * IP client sur Vercel : x-forwarded-for (premier element) avec repli sur
 * x-real-ip. Retourne null si aucune IP n'est trouvee.
 */
export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

/**
 * Hash SHA-256 tronque de l'IP + sel serveur (IP_HASH_SALT). L'IP en clair
 * n'est jamais stockee ni loggee. Retourne null si le sel n'est pas
 * configure (fail-open : pas de comptage possible sans sel).
 */
export function hashIp(ip: string): string | null {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, IP_HASH_LENGTH);
}

/**
 * Identite utilisee pour le rate limit : utilisateur connecte en priorite
 * (limite plus haute, independante de l'IP), sinon IP hashee.
 */
export function resolveIdentity(
  userId: string | null,
  request: NextRequest
): RateLimitIdentity {
  if (userId) return { type: "user", userId };

  const ip = getClientIp(request);
  const ipHash = ip ? hashIp(ip) : null;
  return ipHash ? { type: "ip", ipHash } : { type: "unknown" };
}

/**
 * Compte les generations des dernieres RATE_LIMIT_WINDOW_HOURS heures pour
 * l'identite donnee et compare a la limite applicable.
 *
 * Fail-open systematique : admin absent, colonne ip_hash pas encore migree,
 * Supabase indisponible... toute erreur laisse passer la requete plutot que
 * de bloquer une analyse. Le garde-fou ne doit jamais casser le produit.
 */
export async function checkRateLimit(
  admin: SupabaseClient | null,
  identity: RateLimitIdentity
): Promise<RateLimitResult> {
  if (!admin || identity.type === "unknown") {
    return { limited: false, limit: 0 };
  }

  const limit =
    identity.type === "user" ? AUTHENTICATED_DAILY_LIMIT : ANONYMOUS_DAILY_LIMIT;

  try {
    const since = new Date(
      Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    const query = admin
      .from("generations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    const { count, error } =
      identity.type === "user"
        ? await query.eq("user_id", identity.userId)
        : await query.eq("ip_hash", identity.ipHash);

    if (error) {
      console.error("Rate limit check failed, failing open:", error.message);
      return { limited: false, limit };
    }

    return { limited: (count ?? 0) >= limit, limit };
  } catch (err) {
    console.error("Rate limit check threw, failing open:", err);
    return { limited: false, limit };
  }
}
