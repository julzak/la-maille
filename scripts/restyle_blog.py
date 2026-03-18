#!/usr/bin/env python3
"""
Restyle blog articles in lib/blog-data.ts that are under the word count threshold.
Enriches content with GEO blocks, extends sections, and improves SEO structure.
"""

import os, sys, re, time

skill_dir = os.path.expanduser("~/.claude/skills/seo-geo")
sys.path.insert(0, skill_dir)
from env_loader import load_skill_env
load_skill_env()
import anthropic

BLOG_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../lib/blog-data.ts")
MIN_WORDS = 1500
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are a senior editorial SEO + GEO content writer specializing in knitting.
You rewrite articles to be longer, richer, and optimized for both Google and AI engines (Perplexity, ChatGPT, etc.).

RULES:
1. OUTPUT: Return ONLY the rewritten markdown content. No explanation, no code fences, no metadata.
2. VOICE: Pedagogical, clear, practical. Speak to knitters who understand basics. Never condescending.
3. LENGTH: The article MUST be at least 1500 words. Enrich existing sections and add depth.
4. STRUCTURE: Keep all existing ## headings. You may add new ones if needed. Keep the ## FAQ section.
5. GEO OPTIMIZATION:
   - Start with a clear definition/answer paragraph (no heading) — LLMs love direct answers
   - Include concrete numbers with context (stitch counts, measurements, percentages)
   - Use vocabulary that knitters actually search for (natural keyword density)
   - Make content "citable" — short factual sentences that AI can quote
6. IMAGES: Keep ALL existing ![alt](path) image references EXACTLY as they are. Do not change paths or alt text.
7. INTERNAL LINKS: Keep any existing links. You may add [La Maille](https://la-maille.com/) mentions naturally (max 2).
8. FAQ: Keep existing FAQ questions, improve answers to be more complete. Add 1-2 new relevant FAQs if needed.
9. DO NOT invent statistics or cite sources that don't exist. Use practical knowledge and common knitting wisdom.
10. DO NOT add any markdown code fences. Return raw markdown only.
11. DO NOT use backtick characters (`) anywhere in your output. Use bold (**word**) instead of code formatting.
12. DO NOT use ${} template syntax anywhere."""


def find_content_bounds(ts_content: str, slug: str) -> tuple[int, int] | None:
    """Find the start and end positions of the content template literal for a given slug."""
    slug_pos = ts_content.find(f'slug: "{slug}"')
    if slug_pos == -1:
        return None

    # Find 'content: `' after this slug
    content_marker = "content: `"
    content_start = ts_content.find(content_marker, slug_pos)
    if content_start == -1:
        return None

    # Position right after the opening backtick
    open_pos = content_start + len(content_marker)

    # Find matching closing backtick (not escaped)
    pos = open_pos
    while pos < len(ts_content):
        if ts_content[pos] == '`' and (pos == 0 or ts_content[pos - 1] != '\\'):
            break
        pos += 1

    return (open_pos, pos)


def extract_articles(ts_content: str) -> list:
    """Extract articles from blog-data.ts content."""
    articles = []
    pattern = r'slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*excerpt:\s*"((?:[^"\\]|\\.)*)"\s*,\s*keywords:\s*\[(.*?)\]'

    for m in re.finditer(pattern, ts_content, re.DOTALL):
        slug = m.group(1)
        title = m.group(2)
        keywords = re.findall(r'"([^"]+)"', m.group(4))

        bounds = find_content_bounds(ts_content, slug)
        if not bounds:
            continue

        body = ts_content[bounds[0]:bounds[1]]
        articles.append({
            "slug": slug,
            "title": title,
            "keywords": keywords,
            "content": body,
            "word_count": len(body.split()),
            "bounds": bounds,
        })
    return articles


def build_restyle_prompt(article: dict) -> str:
    return f"""Rewrite this knitting blog article to be richer and longer (minimum 1500 words, currently {article['word_count']} words).

TITLE: {article['title']}
PRIMARY KEYWORD: {article['keywords'][0] if article['keywords'] else article['slug'].replace('-', ' ')}
SECONDARY KEYWORDS: {', '.join(article['keywords'][1:]) if len(article['keywords']) > 1 else 'none'}

CURRENT CONTENT:
{article['content']}

Remember:
- Keep ALL image references exactly as they are (![alt](path))
- Start with a direct definition/answer paragraph (GEO optimization)
- Minimum 1500 words
- Keep existing structure, enrich and expand
- Return ONLY markdown, no code fences, no backticks, no ${{}} syntax"""


def restyle_article(article: dict, client: anthropic.Anthropic) -> str | None:
    """Send article to Claude for restyling. Returns new markdown content."""
    prompt = build_restyle_prompt(article)

    for attempt in range(3):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            new_content = resp.content[0].text.strip()
            # Remove any code fences
            new_content = re.sub(r'^```(?:markdown)?\s*\n?', '', new_content)
            new_content = re.sub(r'\n?```\s*$', '', new_content)
            # Safety: escape backticks and template literals
            new_content = new_content.replace('`', "'")
            new_content = new_content.replace('${', '{')
            return new_content
        except anthropic.RateLimitError:
            print(f"   ⏳ Rate limit — waiting 30s...")
            time.sleep(30)
        except Exception as e:
            print(f"   ❌ Error attempt {attempt + 1}: {e}")
            time.sleep(2 ** attempt)
    return None


def update_reading_time(ts_content: str, slug: str, word_count: int) -> str:
    """Update readingTime for a slug in the TS content."""
    minutes = max(3, round(word_count / 230))
    new_rt = f"{minutes} min read"
    # Find readingTime near this slug
    slug_pos = ts_content.find(f'slug: "{slug}"')
    rt_pattern = re.compile(r'(readingTime:\s*")[^"]+(")')
    # Search only in the vicinity of this slug (next 2000 chars)
    region_start = slug_pos
    region_end = min(slug_pos + 2000, len(ts_content))
    region = ts_content[region_start:region_end]
    new_region, count = rt_pattern.subn(f'\\g<1>{new_rt}\\2', region, count=1)
    if count:
        return ts_content[:region_start] + new_region + ts_content[region_end:]
    return ts_content


def main():
    # Make backup
    with open(BLOG_DATA_PATH, "r", encoding="utf-8") as f:
        ts_content = f.read()

    backup_path = BLOG_DATA_PATH + ".backup"
    with open(backup_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"💾 Backup saved: {backup_path}")

    articles = extract_articles(ts_content)
    print(f"Found {len(articles)} articles")

    to_restyle = [a for a in articles if a["word_count"] < MIN_WORDS]
    print(f"{len(to_restyle)} articles under {MIN_WORDS} words — will restyle\n")

    if not to_restyle:
        print("✅ All articles meet minimum word count.")
        return

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    success, failed = 0, 0

    # Process in reverse order so earlier positions stay valid
    to_restyle.sort(key=lambda a: a["bounds"][0], reverse=True)

    for i, article in enumerate(to_restyle):
        slug = article["slug"]
        print(f"  [{i + 1}/{len(to_restyle)}] {slug} ({article['word_count']}w)...", end=" ", flush=True)

        new_content = restyle_article(article, client)
        if new_content is None:
            print("❌ failed")
            failed += 1
            continue

        new_wc = len(new_content.split())

        # Replace content in ts_content by position
        start, end = article["bounds"]
        ts_content = ts_content[:start] + "\n" + new_content + "\n    " + ts_content[end:]

        # Update reading time
        ts_content = update_reading_time(ts_content, slug, new_wc)

        print(f"✅ {article['word_count']}w → {new_wc}w")
        success += 1
        time.sleep(1)

    # Write back
    with open(BLOG_DATA_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"\n{'=' * 60}")
    print(f"✅ Restyled: {success} | ❌ Failed: {failed}")
    print(f"Updated: {BLOG_DATA_PATH}")


if __name__ == "__main__":
    main()
