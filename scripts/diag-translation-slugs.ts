/**
 * diag-translation-slugs.ts
 *
 * Verifie l'integrite des paires hreflang FR/EN dans lib/blog-data.ts :
 * - chaque translationSlug pointe vers un slug qui existe reellement
 * - chaque paire est reciproque (A -> B implique B -> A)
 * - le slug cible est bien dans l'autre langue (pas de FR -> FR ou EN -> EN)
 *
 * Usage : npm exec -- tsx scripts/diag-translation-slugs.ts
 */
import { articles, articleLang } from "../lib/blog-data";

let errors = 0;

const bySlug = new Map(articles.map((a) => [a.slug, a]));

console.log(`Total articles: ${articles.length}`);
console.log(
  `FR: ${articles.filter((a) => articleLang(a) === "fr").length}, EN: ${
    articles.filter((a) => articleLang(a) === "en").length
  }`
);
console.log("");

const pairsSeen = new Set<string>();

for (const article of articles) {
  if (!article.translationSlug) continue;

  const target = bySlug.get(article.translationSlug);

  if (!target) {
    console.error(
      `[ERROR] "${article.slug}" (${articleLang(article)}) -> translationSlug "${
        article.translationSlug
      }" pointe vers un slug INEXISTANT.`
    );
    errors++;
    continue;
  }

  if (articleLang(target) === articleLang(article)) {
    console.error(
      `[ERROR] "${article.slug}" (${articleLang(article)}) -> "${
        article.translationSlug
      }" (${articleLang(target)}) : meme langue, ce n'est pas une paire de traduction valide.`
    );
    errors++;
  }

  if (target.translationSlug !== article.slug) {
    console.error(
      `[ERROR] Paire non reciproque : "${article.slug}" -> "${
        article.translationSlug
      }", mais "${article.translationSlug}" -> "${
        target.translationSlug ?? "(vide)"
      }".`
    );
    errors++;
  } else {
    const pairKey = [article.slug, target.slug].sort().join(" <-> ");
    if (!pairsSeen.has(pairKey)) {
      pairsSeen.add(pairKey);
      console.log(`[OK] Paire reciproque valide : ${pairKey}`);
    }
  }
}

console.log("");
console.log(`Paires reciproques valides : ${pairsSeen.size}`);
console.log(`Erreurs : ${errors}`);

if (errors > 0) {
  process.exit(1);
}
