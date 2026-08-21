# TODO courant (2026-08-21)

- [ ] Julien : Request Indexing GSC des 14 articles FR + de /blog/knitting-pattern-generators-compared (en attente depuis le chantier blog FR).
- [ ] Julien : decision Pinterest le 2026-09-05 (seuil 50 sessions/mois, 2 sessions au 2026-08-20). Aucun effort d'ici la.
- [ ] Julien : BREVO_API_KEY dans .env.local est morte. Le rapport hebdo affiche "n/d" pour les contacts Brevo tant qu'elle n'est pas remplacee.
- [ ] Bug SEO confirme en prod : /fr (home) est rendue en anglais cote serveur (h2 "How it works" dans le HTML brut), le FR n'arrive qu'a l'hydratation. Touche tout le texte home FR, y compris le FAQPage JSON-LD ajoute le 2026-08-21. A investiguer : useI18n.setState cote serveur dans app/layout.tsx ne semble pas vu par app/page.tsx.
- [ ] Suivre l'erosion de /knitting-pattern-generator (GSC) apres le lot du 2026-08-21 : si les positions sur "image/photo to knitting pattern" ne remontent pas d'ici fin septembre, envisager de rediriger ou de reorienter photo-to-knitting-pattern-complete-guide.
- [ ] Mesurer apres 2 semaines : blog_cta_click, generate_pattern par landing /blog/*, make_public, sign_up (doit coller aux profiles Supabase).
- [ ] Prochain lot FR : maillage dense vers les 2 hubs a volume + contenu "modele gratuit".

---

# Plan SEO FR - La Maille

## Constat (audit 2026-06-22)
- UI produit bilingue FR/EN (cookie + Accept-Language).
- 27 articles blog 100% EN, hardcodes dans `lib/blog-data.ts`, sans champ `lang`.
- Chrome du blog (listing, dates, CTA) hardcode EN.
- Zero contenu SEO FR alors que marque + produit + demande sont FR.

## Insight data (DataForSEO, locale fr)
- 327 mots-cles tricot pertinents, 571 k recherches/mois.
- Demande FR != blog EN : dominee par "patrons/modeles gratuits" + tutos de points.
- Decisions validees : slugs FR a plat dans /blog/ + contenu net-new FR.

## Decisions d'architecture validees
1. URL : slugs FR a plat dans `/blog/` (ex: `/blog/point-de-riz-tricot`), champ `lang` par article, listing filtre par langue, hreflang entre paires.
2. Contenu : net-new pilote par la recherche FR (pas de traduction des 27 EN).

## ETAT AU 2026-06-22 (soir) : 16 articles FR
- Lot 4 (PR #5, en CI) : 2 hubs transactionnels (modeles-tricot-gratuits vol 6600, modele-pull-a-tricoter-gratuit vol 8100), texte + 6 images dans la meme PR.
- 16 articles FR au total, 48 images. Build 63 pages OK.
- echantillon/top-down/encolure : pas de page (pas de volume FR propre), couverts ailleurs.

---

## ETAT AU 2026-06-22 (fin apres-midi)

### EN PROD : 14 articles FR (Phases 1+2+3)
- PR #1 (2 pilotes), PR #2 (5), PR #3 (7 vetements) toutes mergees. ~470k recherches/mois couvertes.
- Maillage : ~59 liens internes bidirectionnels hub-and-spoke (build_blog_fr.py autolink, idempotent).

### Images : EN COURS
- Cle Google AI valide fournie + persistee (.env.local + skill .env, var GOOGLE_AI_STUDIO_API_KEY).
- Skill 03_images.py migre Imagen 4 -> gemini-3.1-flash-image (valide runtime : image OK 11.6s).
- Pour la-maille : gen_images.py (local WebP 1200x750, public/images/blog/<filename-skill-slug>/). 42 images en generation.
- ATTENTION : les images vont dans des dossiers nommes par le SLUG DU SKILL (ex tricoter-un-bonnet/), pas le slug canonique (bonnet-a-tricoter). C'est coherent car to_article ET gen_images utilisent img["filename"]. Le markdown pointe au bon endroit.
- Suite : `python3 build_blog_fr.py --with-images` (injecte le markdown img) -> build -> PR #4 (blog-data.ts + public/images/blog/**).

### Plan FR : TERMINE (sauf images)
- echantillon/top-down : pas de page dediee (pas de volume FR), couverts dans comment-tricoter-un-pull.

---

## ETAT AU 2026-06-22 (apres-midi)

### LIVRE EN PROD
- PR #1 mergee (commit 124d89d) : plomberie i18n blog + 2 pilotes FR (point de riz, point mousse) + maillage (related filtre langue + autolink hub-and-spoke). CI verte, deploy Vercel.

### LOT 2 (2026-06-22 apres-midi) : SHIPPE
- Credits Anthropic recharges -> 5 articles generes (point-de-ble, les-points-de-tricot, cotes-anglaises, comment-tricoter-un-pull, quelle-laine).
- PR #2 (feat/blog-fr-batch2) ouverte, en CI. 7 articles FR au total. Maillage: 10 liens internes.
- Slugs forces via slug_map. Tirets longs normalises a la source (dedash dans to_article.py).

### BLOCAGE PHASE IMAGE : clé Google AI invalide
- `models.list()` renvoie "API key not valid" avec la clé projet (.env.local GEMINI_API_KEY) ET la clé skill (GOOGLE_AI_STUDIO_API_KEY).
- Les 7 articles FR sont en text-only (comme les EN au depart). Images = passe unique ulterieure.
- ACTION USER : fournir/regenerer une cle Google AI Studio valide (aistudio.google.com -> API keys). A faire de toute facon vu la depreciation Imagen 4 (17 aout).
- Modele image cible : `gemini-3.1-flash-image` (recommande Google), generation LOCALE WebP (convention projet), pas le 03_images.py du skill (Imagen, deprecie).

### Skill 03_images.py : migration Imagen -> Gemini (avant 17 aout 2026)
- Fichier PARTAGE. Utilise imagen-4.0-generate-001 (un des 3 endpoints supprimes). Non bloquant maintenant. A migrer vers gemini-3.1-flash-image (change la forme API). En attente decision user.

### (obsolete) BLOCAGE Anthropic - resolu
- La generation de contenu (02_generate.py) utilise `ANTHROPIC_API_KEY` depuis `~/.claude/skills/seo-geo/.env`.
- Ce compte est A SEC : "credit balance is too low". Lot 2 (5 articles) = 0 genere.
- ACTION USER : recharger des credits sur console.anthropic.com (Plans & Billing) du compte lie a cette cle.
- DES QUE recharge, relancer (tout est pret) :
```bash
cd ~/.claude/skills/seo-geo && python3 02_generate.py \
  --keywords-file ~/Projects/la-maille/runs/fr/kw_batch2.json \
  --profile la-maille-fr --mode blog --all --max-pages 5 \
  --output-dir ~/Projects/la-maille/runs/fr/pages
# puis forcer les slugs canoniques (slug_map_batch2.json), puis :
cd ~/Projects/la-maille/runs/fr && python3 build_blog_fr.py   # rebuild bloc FR + autolink
cd ~/Projects/la-maille && npm run build                       # verif
# puis branche + commit + PR comme #1
```

### Constat recherche (factuel)
- echantillon et top-down : PAS de volume FR propre (seeds pollues finance/marques). Pas de page dediee : ces concepts seront couverts DANS la pillar comment-tricoter-un-pull.
- Lot 2 valide (donnees reelles) : point-de-ble-tricot, les-points-de-tricot, cotes-anglaises-tricot, comment-tricoter-un-pull, quelle-laine-pour-tricoter-un-pull.

### Outillage pret (runs/fr/)
- to_article.py (JSON skill -> Article md), build_blog_fr.py (autolink + injection entre marqueurs, idempotent), kw_batch2.json + slug_map_batch2.json.
- Bloc FR dans blog-data.ts entre marqueurs `// === FR ARTICLES ... START/END ===`.

---

## ETAT AU 2026-06-22 (checkpoint matin - session interrompue)

### FAIT et verifie
- Volet A code COMPLET + `npm run build` OK (clean). Changements non commites dans le working tree :
  - `lib/blog-data.ts` : type `ArticleLang`, champ `lang?`/`translationSlug?`, helper `articleLang()`, `getAllArticles(lang?)` filtre.
  - `app/blog/page.tsx` : listing filtre par `getServerLanguage()`, chrome FR/EN, dates localisees. (passe en rendu dynamique = normal)
  - `app/blog/[slug]/page.tsx` : chrome suit la langue de l'article, hreflang (si `translationSlug`), related filtre par langue, JSON-LD `inLanguage`.
  - Sitemap : inchange, inclut deja les 2 langues via `getAllArticles()`.
- Profil skill `la-maille-fr` cree dans `~/.claude/skills/seo-geo/profiles.json`.
- Bug skill corrige : `02_generate.py` passe en streaming (timeout sur 16k tokens non-streame). FICHIER PARTAGE.
- Insight "quantite de laine" verifie : 1 page Phase 2 (vol modeste, fort fit produit/GEO).

### REPRISE (commande unique pour relancer les pilotes)
```bash
cd ~/.claude/skills/seo-geo && python3 02_generate.py \
  --keywords-file ~/Projects/la-maille/runs/fr/kw_pilotes.json \
  --profile la-maille-fr --mode blog --all --max-pages 2 \
  --output-dir ~/Projects/la-maille/runs/fr/pages
```
Puis : images (`03_images.py`), convertir le JSON page -> format `Article` et injecter dans `lib/blog-data.ts` avec `lang:"fr"`, `npm run build`, montrer le rendu, commit.

### A NE PAS OUBLIER
- Aucun commit fait. Working tree a checkpointer si besoin.
- `lib/blog-data.ts.backup` est un fichier non suivi (issu d'un restyle precedent), pas lie a cette session.

## Volet B - Contenu (production via skill seo-geo)

### Phase 1 - Quick wins (KD20, faciles, autorite) ~83 k vol/mois
- [ ] point-de-riz-tricot (6 600)
- [ ] point-mousse-tricot (3 600)
- [ ] point-de-ble-tricot (3 600)
- [ ] les-points-de-tricot (guide hub, 3 600)
- [ ] cotes-jersey-tricot (1 600)

### Phase 2 - Money pages (product-aligned, conversion)
- [ ] comment-tricoter-un-pull (1 900)
- [ ] calcul-echantillon-tricot
- [ ] tricoter-pull-top-down
- [ ] modele-pull-a-tricoter-gratuit (8 100)
- [ ] modeles-tricot-gratuits (hub, 6 600)
- [ ] quelle-laine-pour-tricoter-un-pull (9 900)

### Phase 3 - Expansion volume (patrons par vetement)
- [ ] bonnet, echarpe/snood, gilet/cardigan, layette/bebe, chaussons, tricot-debutant, tricoter-en-rond

## Verification
- `npm run build` passe.
- Listing FR affiche les articles FR, EN affiche les EN.
- curl canonical + hreflang sur une page FR.
- Acceptation fonctionnelle Julien sur le rendu.

## Donnees brutes
- `runs/fr/keywords_fr_filtered.json` (327 kw)
- `runs/fr/editorial_plan_fr.json` (plan par page)
