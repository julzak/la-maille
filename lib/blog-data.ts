export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readingTime: string;
  keywords: string[];
}

export const articles: Article[] = [
  {
    slug: "how-to-read-knitting-pattern-from-photo",
    title: "How to Read a Knitting Pattern from a Photo",
    excerpt:
      "Ever seen a beautiful sweater and wished you could knit it? Here's how to break down any knitted garment into its key components.",
    publishedAt: "2026-02-19",
    readingTime: "5 min read",
    keywords: [
      "read knitting pattern",
      "knitting from photo",
      "reverse engineer knitting",
    ],
    content: `
## Why reverse-engineer a knit?

You're scrolling through Instagram, browsing a vintage shop, or admiring a friend's sweater — and you think: *I want to knit that.* The problem? There's no pattern. That's where reading a knit from a photo comes in.

## What to look for

When you see a knitted garment, trained eyes can pick up a surprising amount of information from a single photo:

### 1. Garment type
Is it a pullover, a cardigan (with a front opening), a vest (no sleeves), or something else? This determines the basic structure of your pattern.

### 2. Construction method
- **Top-down**: Started from the neckline, worked downward. Look for raglan lines or a yoke.
- **Bottom-up**: Started from the hem. Seams at the shoulders are a giveaway.
- **In the round**: No side seams visible.
- **Flat pieces**: Visible seams at the sides and shoulders.

### 3. Neckline
Crew neck, V-neck, mock neck, turtleneck, boat neck — each one is knit differently. Look at how the fabric meets the neck.

### 4. Sleeves
- **Set-in sleeves**: A curved seam around the armhole.
- **Raglan**: Diagonal lines from the underarm to the neckline.
- **Drop shoulder**: The shoulder seam sits below the natural shoulder line.

### 5. Stitch pattern
Stockinette (smooth V shapes), ribbing (alternating columns), garter (horizontal ridges), or something more complex like cables or lace.

## From observation to pattern

Once you've identified these elements, you need three things to turn them into a knitting pattern:

1. **Your body measurements** — chest circumference, desired length, arm length
2. **Your gauge** — how many stitches and rows per 10cm with your chosen yarn
3. **The math** — calculating stitch counts for each section

This is exactly what La Maille automates. Upload a photo, and the AI identifies all the elements above. Add your measurements and gauge, and you get a complete pattern with row-by-row instructions.

## Tips for better results

- Use a **front view** photo with good lighting
- **Lay the garment flat** or photograph it on a hanger
- Avoid photos with heavy folds, wrinkles, or busy backgrounds
- The clearer the stitch texture is visible, the better

## Try it yourself

Ready to turn a photo into a pattern? [Upload your photo on La Maille](/) and get your custom pattern in minutes — for free.
    `.trim(),
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
