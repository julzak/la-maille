/**
 * Test de regression : les pages vitrine doivent etre prerendues (statiques).
 *
 * Contexte (2026-11-13) : le layout racine lisait la langue via headers() /
 * cookies(), ce qui basculait TOUT le site en rendu dynamique. Chaque visite
 * d'une page vitrine ou d'un article de blog invoquait une fonction Vercel,
 * et le quota Fluid Active CPU du forfait Hobby (4 h) etait consomme a 75 %.
 *
 * A lancer apres `npm run build` :
 *   ./node_modules/.bin/tsx scripts/test-static-marketing.ts
 *
 * Verifie dans .next/ :
 *  - chaque page vitrine EN et FR figure dans prerender-manifest.json
 *  - les articles de blog EN et FR y figurent aussi
 *  - le HTML prerendu porte la bonne langue (<html lang>), EN a la racine,
 *    FR sous /fr
 *  - les routes applicatives ne sont PAS prerendues (elles dependent du
 *    cookie de langue et de la session)
 *
 * Sanity check : sur le build d'avant correctif (commit f5c5dc8), ce script
 * echoue sur toutes les pages vitrine. C'est la regression qu'il garde.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const NEXT_DIR = join(__dirname, "..", ".next");

let failures = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`OK   - ${label}`);
  } else {
    failures++;
    console.error(`FAIL - ${label}`);
  }
}

const manifestPath = join(NEXT_DIR, "prerender-manifest.json");
if (!existsSync(manifestPath)) {
  console.error("FAIL - .next/prerender-manifest.json absent : lancer `npm run build` d'abord");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  routes: Record<string, unknown>;
};
const prerendered = new Set(Object.keys(manifest.routes));

const MARKETING: Array<{ path: string; lang: "en" | "fr" }> = [
  { path: "/", lang: "en" },
  { path: "/blog", lang: "en" },
  { path: "/how-it-works", lang: "en" },
  { path: "/knitting-pattern-generator", lang: "en" },
  { path: "/privacy", lang: "en" },
  { path: "/terms", lang: "en" },
  { path: "/fr", lang: "fr" },
  { path: "/fr/blog", lang: "fr" },
  { path: "/fr/how-it-works", lang: "fr" },
  { path: "/fr/knitting-pattern-generator", lang: "fr" },
  { path: "/fr/privacy", lang: "fr" },
  { path: "/fr/terms", lang: "fr" },
];

function htmlLang(path: string): string | null {
  const file = join(NEXT_DIR, "server", "app", path === "/" ? "index.html" : `${path.slice(1)}.html`);
  if (!existsSync(file)) return null;
  const match = readFileSync(file, "utf8").match(/<html[^>]*\blang="([^"]+)"/);
  return match ? match[1] : null;
}

for (const { path, lang } of MARKETING) {
  assert(`${path} est prerendue`, prerendered.has(path));
  assert(`${path} porte <html lang="${lang}">`, htmlLang(path) === lang);
}

const blogEn = Array.from(prerendered).filter((r) => r.startsWith("/blog/"));
const blogFr = Array.from(prerendered).filter((r) => r.startsWith("/fr/blog/"));
assert(`articles EN prerendus (${blogEn.length})`, blogEn.length > 0);
assert(`articles FR prerendus (${blogFr.length})`, blogFr.length > 0);
if (blogEn.length > 0) {
  assert(`${blogEn[0]} porte <html lang="en">`, htmlLang(blogEn[0]) === "en");
}
if (blogFr.length > 0) {
  assert(`${blogFr[0]} porte <html lang="fr">`, htmlLang(blogFr[0]) === "fr");
}

for (const path of ["/analyse", "/patron", "/mes-patrons", "/tricot"]) {
  assert(`${path} reste dynamique (non prerendue)`, !prerendered.has(path));
}

if (failures > 0) {
  console.error(`\n${failures} echec(s)`);
  process.exit(1);
}
console.log("\nTout est OK");
