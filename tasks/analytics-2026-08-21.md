# Analyse analytics La Maille, 2026-08-21

Sources : GA4 (propriete 525258991), Supabase jazzy-apps (generations, profiles, saved_patterns), exports GSC audits/gsc-baseline-*. Script : scripts/diag-analytics-2026-08.ts.
Vercel Web Analytics : non active sur le projet (404 API).

## Constats
- Users actifs / semaine : S26 196, S31 218, S32 226 (pic), S33 174. ~20 % du trafic est bot (Chine 130 + Singapour 78 sessions / 30 j, engagement 2-10 %, 1-6 s, "direct" sur le blog EN).
- SEO EN = moteur : Google organic 360 -> 527 sessions (30 j vs 30 j). GSC 28 j : 279 -> 359 -> 397 clics, impressions 9,4k -> 19,2k. CTR en baisse 2,97 % -> 2,07 % (nouvelles pages sur positions basses).
- ChatGPT x3 : 24 -> 77 sessions, engagement 65 %, 31 % de generate_pattern par session (Google : 12 %).
- Blog FR : landing /fr 4 -> 32 sessions / semaine, engagement 56 %. Hubs a volume (modeles-tricot-gratuits, modele-pull-a-tricoter-gratuit) : 1-3 sessions, pas positionnes.
- Generations : record S32 = 68. Rejet 45-51 % -> 25-32 % depuis le 3 aout (correle rate limit + Opus 5, cause non confirmee). Motifs de rejet = uploads hors sujet (tissu tisse, amigurumi, illustrations, plaids, WIP).
- Pinterest : 2 sessions UTM en 15 jours (10 pins / 25). Decision formelle le 2026-09-05 (seuil 50/mois).
- Patrons publics : 0 sur 37+. Inscriptions : 1-3 / semaine, 68 profils. Event GA sign_up casse (1 vs 7 reels).
- Fuite principale : top 3 articles EN (282 sessions) -> 0 a 4 generate_pattern.
- Page produit /knitting-pattern-generator : 117 -> 89 clics GSC, pos 6,9 -> 8,1. Requete par requete : "knitting pattern generator free" 3,6 -> 6,2, "image to knitting pattern" 7 -> 20,9, "photo to knitting pattern" 6,1 -> 10,1. Home +56 % d'impressions, l'article photo-to-knitting-pattern-complete-guide prend 22 imp sur "image to knitting pattern". Hypothese : cannibalisation interne (assumee). Canonical + hreflang live verifies corrects.

## Livre dans PR feat/growth-acceleration-2026-08
1. CTA produit inline dans tous les articles (avant le 3e H2), event blog_cta_click. CTA de fin EN pointe sur /knitting-pattern-generator.
2. seoTitle / seoDescription sur 5 articles a forte impression et faible CTR.
3. GEO : FAQ visible + FAQPage JSON-LD sur la home, bloc reponse directe sur la page produit, article comparatif knitting-pattern-generators-compared, robots.txt explicite pour GPTBot/ClaudeBot/PerplexityBot & co, /llms.txt.
4. Fix trackEvent (file dataLayer avant chargement gtag) -> sign_up.
5. Nudge "rendre public" apres sauvegarde (event make_public).
6. Rapport hebdo : exclusion Chine/Singapour, section assistants IA, compteur Brevo.
