# BRIEF-03 — Pages patrons publiques indexables (SEO programmatique)

## Objectif
Un patron sauvegardé peut, sur consentement explicite de son auteur, devenir une page publique indexable avec sa propre URL et son image OG : chaque usage du produit alimente le SEO.

## Contexte
- Aujourd'hui : AUCUNE page patron publique. `/patron`, `/patron/print`, `/mes-patrons` sont noindex + disallow dans `robots.txt` ; `GET /api/patterns/[id]` exige l'auth et vérifie `user_id = auth.uid()`.
- Table `saved_patterns` (jazzy-apps) avec RLS par user. 37 patrons existants.
- OG : une seule image statique `/og-image.png` pour tout le site (`app/layout.tsx:35-42`). Next 14 supporte les OG images dynamiques via route `opengraph-image.tsx` ou `ImageResponse`.
- Cadrage VISION.md : ce n'est PAS une feature virale, c'est de la génération de contenu indexable. Le CTA de la page est "Générer mon patron depuis une photo" vers la home.
- Privacy, décision cadrée : la photo source n'est JAMAIS publiée (elle peut montrer une personne). La page publique montre : titre auto-généré (type de vêtement + caractéristiques + langue), le patron (instructions), les caractéristiques d'analyse. Pas de nom d'auteur.

## Comportement attendu
1. Migration : colonnes `is_public` (bool, défaut false) + `public_slug` (text unique, nullable) sur `saved_patterns`, avec rollback. Policy RLS de lecture publique UNIQUEMENT quand `is_public = true`.
2. Dans `/mes-patrons`, chaque patron a un toggle "Rendre public" avec explication claire (visible par tous, indexé par Google, photo jamais publiée). Activer génère un slug lisible (ex : `pull-raglan-col-rond-a1b2c3`) et affiche l'URL. Désactiver rend la page 404 immédiatement.
3. Nouvelle page publique `app/patron/p/[slug]/page.tsx` : rendu serveur (SSR/ISR), indexable, metadata dédiées (title, description, canonical), JSON-LD `HowTo` ou `Article`, OG image générée dynamiquement (titre + type de vêtement + branding La Maille via `ImageResponse`, pas d'appel API image externe).
4. Les pages publiques entrent dans `app/sitemap.ts` (requête des slugs publics).
5. CTA visible en haut et bas de page : "Créez votre patron depuis une photo" → home.

## Critères d'acceptation (testables en parcours utilisateur)
- [ ] Un utilisateur connecté rend un patron public depuis `/mes-patrons` et voit l'URL publique.
- [ ] Un visiteur non connecté (navigation privée) ouvre cette URL et voit le patron complet, sans photo source, sans nom d'auteur.
- [ ] Le toggle désactivé → la même URL rend une 404.
- [ ] La page publique a title/description/canonical propres, une OG image dédiée (vérifiable via un débogueur OG ou le HTML), et figure dans `/sitemap.xml`.
- [ ] Un patron privé reste inaccessible : requête directe API ou URL devinée → 404/401, jamais de fuite.
- [ ] Les patrons FR et EN rendent leur page dans leur langue.

## Hors périmètre
- Pas de galerie publique "tous les patrons" (v2 : attendre d'avoir >30 pages publiques).
- Pas de publication de la photo source, même en option.
- Pas de compteurs de vues, likes, commentaires.
- Ne pas toucher le flux de génération ni `/api/analyze`.

## Dépendances
- BRIEF-01 mergé (cohérence des CTA et de l'infra de conversion sur les pages).
- Migration à appliquer sur jazzy-apps avant merge.

## Budget et conditions d'arrêt
- Périmètre attendu : ~8-10 fichiers, zones `app/patron/p/`, `app/mes-patrons/`, `app/sitemap.ts`, migration SQL, `lib/i18n.ts`.
- Modèle d'exécution recommandé : fable/opus (migration + policy RLS publique sur des données utilisateur + choix d'indexation : le coût d'une erreur est une fuite de données ou un désastre SEO).
- Arrêt SUCCÈS : critères verts + `npm run build` propre + PR ouverte.
- Arrêt SUSPENSION : ambiguïté bloquante, dépendance manquante, ou budget dépassé de moitié sans critère vert.

## Vérification
Parcours complet en local avec deux navigateurs (connecté / privé). Vérifier la RLS par requête REST anonyme directe sur `saved_patterns` (seuls les publics sortent). Valider l'OG image et le JSON-LD sur le HTML rendu. `npm run build`.

## Questions ouvertes
- Proposer aussi le toggle au moment de la sauvegarde (opt-in dans la modale de save) ou seulement dans `/mes-patrons` ? Défaut retenu : seulement `/mes-patrons`, pour un diff minimal.
