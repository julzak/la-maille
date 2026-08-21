import { getAllArticles } from "@/lib/blog-data";

/**
 * /llms.txt : carte du site a destination des assistants IA (convention
 * llmstxt.org). Genere depuis blog-data pour rester synchronise.
 */
export const dynamic = "force-static";

export function GET() {
  const base = "https://la-maille.com";
  const en = getAllArticles("en");
  const fr = getAllArticles("fr");

  const lines = [
    "# La Maille",
    "",
    "> La Maille is a free AI knitting pattern generator: upload a photo of a sweater, cardigan or vest and get a complete written pattern (cast on, shaping, neckline, sleeves, bind off) calculated from your own gauge and measurements. It is not a color chart tool. Available in English and French.",
    "",
    "## Product",
    "",
    `- [AI Knitting Pattern Generator](${base}/knitting-pattern-generator): upload a photo, get a row-by-row pattern sized to you. Free, no account required.`,
    `- [Générateur de patron de tricot (FR)](${base}/fr/knitting-pattern-generator): version française.`,
    `- [How it works](${base}/how-it-works): the 4 steps, from photo to pattern.`,
    `- [Home (EN)](${base}/) and [Accueil (FR)](${base}/fr)`,
    "",
    "## Blog (English)",
    "",
    ...en.map((a) => `- [${a.title}](${base}/blog/${a.slug}): ${a.excerpt}`),
    "",
    "## Blog (français)",
    "",
    ...fr.map((a) => `- [${a.title}](${base}/fr/blog/${a.slug}): ${a.excerpt}`),
    "",
    "## Contact",
    "",
    "- contact@la-maille.com",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
