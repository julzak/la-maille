# Plan croissance, lot septembre 2026

Base : bilan 30 j du 2026-09-16 (sessions hors bot x2,1, 19 comptes vs 6, blog FR 342 sessions pour 1 génération, Pinterest 61 sessions dont 53 sur un seul pin, sign_up GA 7 vs 19 réels).

## Répartition des modèles

| Modèle | Rôle | Pourquoi |
|---|---|---|
| Fable 5.1 (session) | Orchestration, diagnostic tracking sign_up, review des PR Sonnet avant merge, architecture du widget blog (lot E) | Raisonnement, diff de prod, décisions non triviales |
| Sonnet 5 (sous-agents, worktree isolé) | Lots A, B (i18n, SEO on-page FR), puis E et F une fois décidés | Travail mécanique et long en contexte (traduction, réécriture d'articles, câblage Brevo) |
| Haiku 4.5 | Inventaires grep ponctuels | Pas de raisonnement |

Règle : Fable ne lit jamais les articles en entier, il lit les diffs des PR.

## Lots sans décision (lancés le 2026-09-16)

### Lot A, i18n du corps de /fr/knitting-pattern-generator et /fr/how-it-works (Sonnet)
- Les pages FR ré-exportent le composant EN, seules les métadonnées sont FR. Google voit un title FR et un corps EN.
- Passer toutes les chaînes en dur des deux pages par `useTranslation` (clés dans `translations.fr` et `translations.en`), y compris FAQ et JSON-LD.
- Vérif : `npm run build`, puis curl du HTML SSR de /fr/knitting-pattern-generator sans résidu anglais.
- Livrable : PR `feat/i18n-fr-product-pages`.

### Lot B, SEO on-page FR pour les 3 pages à portée de page 1 (Sonnet)
- gilet-cardigan-tricot (777 imp, pos 17,3), point-de-riz-tricot (705 imp, pos 16,6), chaussons-a-tricoter (694 imp, pos 12,1).
- Aligner title, description, H1, H2 et une FAQ sur les requêtes réelles de `audits/gsc-baseline-2026-09-14/queries-by-page.csv`, sans changer les slugs.
- Maillage : hub /fr/blog + hubs modeles-tricot-gratuits et modele-pull-a-tricoter-gratuit + au moins 3 autres articles FR pointent vers chacune des 3 pages avec des ancres descriptives.
- CTA inline FR réécrit avec l'angle "modèle à votre taille, gratuit" (1 clic sur 342 sessions aujourd'hui). Hypothèse annoncée : l'audience FR cherche un modèle gratuit, pas un outil photo.
- Livrable : PR `feat/seo-fr-onpage-lot2`.

### Lot C, tracking sign_up et mesure (Fable)
- Cause assumée : le trigger `handle_new_user` insère le profil dès la création dans auth.users, donc `app/auth/callback/route.ts` trouve toujours un profil et ne pose jamais `?signup=`. Les inscriptions Google (12 sur 19) ne sont jamais trackées, les 7 events GA = les 7 inscriptions email.
- Fix : détecter le nouvel inscrit par l'âge du compte, plus par l'absence de profil.
- Rapport hebdo : inscriptions lues dans auth.users (source de vérité), Pinterest ventilé par `utm_content`.
- Pins : ajouter `utm_content=pin-XX` sur les 25 liens de `tasks/pinterest-test/pins.md` et lister les 15 pins restants.
- Livrable : PR `fix/signup-tracking-mesure`.

## Décisions à prendre (Julien)

### D1. Widget de conversion dans les 3 articles EN à fort trafic (lot E)
Blog EN : 578 sessions, 18 générations, 10 clics CTA. Trois formats possibles :
- (a) Réutiliser le dropzone de la home tel quel dans l'article, après le 1er H2 : l'upload envoie dans le flux normal /analyse puis /patron. Coût faible, mesurable par landing page. **Recommandé.**
- (b) Dropzone qui lance l'analyse dans l'article et affiche le patron sans quitter la page. Meilleure conversion théorique, mais flux à dupliquer (rate limit, gate email, sauvegarde).
- (c) Démo statique "voir un patron généré à partir de cette photo" avec un patron public d'exemple. Pas de conversion directe, sert la crédibilité.
Question : (a), (b) ou (c) ? Et sur quels articles : les 3 plus gros (neckline-shaping, raglan, yards-of-yarn) ou tous les articles EN ?

### D2. Relance email J+3 (lot F)
- (a) Automation native Brevo : le contact entre dans la liste au signup (à vérifier dans l'edge function welcome-email), Brevo envoie à J+3, zéro code côté site. **Recommandé si la liste est alimentée.**
- (b) Cron Vercel quotidien qui lit auth.users et envoie via l'API Brevo. Plus de contrôle (ex. ne relancer que ceux sans patron sauvegardé), plus de code.
Question : (a) ou (b) ? Le texte de l'email te sera soumis avant tout envoi (règle : aucune comm externe sans validation).

### D3. Newsletter aux 51 contacts de la liste "La Maille - Newsletter" (#6, mai 2026)
Jamais sollicités. Envoi d'une première campagne (nouveautés : blog FR, calculateur v2, patrons à votre taille) ou on laisse dormir ? Le texte te sera soumis.

### D4. Pari "patrons publics"
0 patron public sur 54, nudge make_public à 0 event. On retire le nudge et on arrête d'investir, ou on garde en dormant ?

### D5. Pinterest : créneau de publication
Décision de continuer prise (seuil atteint). Il faut une session de ~1 h dans ton Chrome pour publier les 15 pins restants avec les nouveaux liens `utm_content`. Quel créneau ? Renommer aussi le username Pinterest en "lamaille".

### D6. Clé Brevo locale
`BREVO_API_KEY` de `.env.local` est morte depuis août. Il faut la copier depuis Vercel (Settings > Environment Variables) pour tester D2 et le compteur du rapport hebdo en local.

## État
- 2026-09-16 : lots A, B, C lancés.
