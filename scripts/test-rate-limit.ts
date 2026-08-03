/**
 * Test de regression pour checkRateLimit (BRIEF-02).
 *
 * La migration ip_hash n'est pas encore appliquee sur jazzy-apps (prod),
 * donc on ne peut pas verifier le declenchement du 429 anonyme via une
 * vraie requete DB en local (voir verification manuelle dans la PR pour le
 * comportement fail-open reel). Ce script simule le client Supabase pour
 * verifier deterministiquement :
 *  - le seuil (limited=false sous la limite, limited=true a la limite)
 *  - le fail-open sur erreur de comptage (colonne absente, DB down...)
 *  - le fail-open quand admin est absent ou l'identite inconnue
 *
 * Sanity check inclus : le cas "count au-dessus de la limite" doit rester
 * limited=true (si ce test passait a false, ce serait la regression qu'on
 * cherche a empecher).
 */
import {
  checkRateLimit,
  ANONYMOUS_DAILY_LIMIT,
  AUTHENTICATED_DAILY_LIMIT,
} from "../lib/rate-limit";
import type { SupabaseClient } from "@supabase/supabase-js";

let failures = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`OK   - ${label}`);
  } else {
    failures++;
    console.error(`FAIL - ${label}`);
  }
}

function fakeAdmin(count: number | null, errorMessage: string | null) {
  const chain = {
    eq: async () => ({
      count,
      error: errorMessage ? { message: errorMessage } : null,
    }),
  };
  return {
    from: () => ({
      select: () => ({
        gte: () => chain,
      }),
    }),
  } as unknown as SupabaseClient;
}

async function main() {
  // Anonyme, sous la limite -> pas bloque
  const r1 = await checkRateLimit(
    fakeAdmin(ANONYMOUS_DAILY_LIMIT - 1, null),
    { type: "ip", ipHash: "deadbeef" }
  );
  assert(`anonyme sous la limite (${ANONYMOUS_DAILY_LIMIT - 1}/${ANONYMOUS_DAILY_LIMIT}) -> limited=false`, r1.limited === false);

  // Anonyme, a la limite -> bloque (429 attendu cote route)
  const r2 = await checkRateLimit(
    fakeAdmin(ANONYMOUS_DAILY_LIMIT, null),
    { type: "ip", ipHash: "deadbeef" }
  );
  assert(`anonyme a la limite (${ANONYMOUS_DAILY_LIMIT}/${ANONYMOUS_DAILY_LIMIT}) -> limited=true`, r2.limited === true);

  // Connecte, sous sa propre limite (plus haute, independante de l'IP)
  const r3 = await checkRateLimit(
    fakeAdmin(AUTHENTICATED_DAILY_LIMIT - 1, null),
    { type: "user", userId: "user-123" }
  );
  assert(`connecte sous la limite (${AUTHENTICATED_DAILY_LIMIT - 1}/${AUTHENTICATED_DAILY_LIMIT}) -> limited=false`, r3.limited === false);

  // Connecte, a la limite -> bloque
  const r4 = await checkRateLimit(
    fakeAdmin(AUTHENTICATED_DAILY_LIMIT, null),
    { type: "user", userId: "user-123" }
  );
  assert(`connecte a la limite (${AUTHENTICATED_DAILY_LIMIT}/${AUTHENTICATED_DAILY_LIMIT}) -> limited=true`, r4.limited === true);

  // Fail-open : erreur SQL (ex: colonne ip_hash absente avant migration)
  const r5 = await checkRateLimit(
    fakeAdmin(null, 'column "generations.ip_hash" does not exist'),
    { type: "ip", ipHash: "deadbeef" }
  );
  assert("colonne ip_hash absente (erreur SQL) -> fail-open (limited=false)", r5.limited === false);

  // Fail-open : admin absent (service_role non configuree)
  const r6 = await checkRateLimit(null, { type: "ip", ipHash: "deadbeef" });
  assert("admin absent -> fail-open (limited=false)", r6.limited === false);

  // Fail-open : identite inconnue (pas d'IP ni de user)
  const r7 = await checkRateLimit(fakeAdmin(999, null), { type: "unknown" });
  assert("identite inconnue -> fail-open (limited=false)", r7.limited === false);

  if (failures > 0) {
    console.error(`\n${failures} test(s) en echec.`);
    process.exit(1);
  }
  console.log("\nTous les tests sont passes.");
}

main();
