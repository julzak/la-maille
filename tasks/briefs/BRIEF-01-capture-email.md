# BRIEF-01 — Capture email au moment de valeur (export PDF)

## Objectif
L'utilisateur anonyme qui veut emporter son patron (PDF ou impression) donne son email ; le patron reste entièrement lisible à l'écran sans rien donner.

## Contexte
- Parcours actuel : photo → `/analyse` (`app/analyse/page.tsx`) → patron complet affiché sur `/patron` (`app/patron/page.tsx`), imprimable via `/patron/print` et exportable en PDF, le tout sans auth ni email. C'est la cause mesurée des 6 signups/mois pour 186 générations/mois.
- Décision actée (Julien, 2026-08-03, ne pas re-litiger) : gate email sur l'export PDF ET la vue impression (sinon l'impression contourne trivialement le gate). Lecture écran libre. Compte toujours optionnel.
- Brevo est déjà utilisé (edge function `welcome-email`, `BREVO_API_KEY` dans `.env.local`). L'app n'a AUCUN endpoint email côté Next : à créer.
- i18n : toute string passe par `lib/i18n.ts`, clés FR ET EN obligatoires. Piège connu : ne jamais mettre `t` en dépendance de `useCallback`/`useEffect` (boucle infinie, voir CLAUDE.md).
- Utilisateur connecté : son email est connu, le gate ne doit JAMAIS lui apparaître.

## Comportement attendu
1. Sur `/patron`, clic sur "Exporter en PDF" ou "Imprimer" par un anonyme → modal : champ email + bouton déverrouiller + checkbox OPTIONNELLE décochée "Recevoir des conseils tricot et les nouveautés" (consentement newsletter séparé du déverrouillage, exigence RGPD).
2. Email soumis → `POST /api/subscribe` (nouvelle route) : upsert du contact dans Brevo avec attributs (langue, `garment_type`, consentement newsletter oui/non, source `pdf_gate`) → déverrouillage immédiat côté client (pas d'attente d'un email de confirmation : la délivrabilité ne doit pas bloquer l'accès).
3. Le déverrouillage est mémorisé en localStorage : l'utilisateur n'est jamais re-sollicité sur ce navigateur.
4. Email invalide ou erreur Brevo → message d'erreur clair, le patron reste lisible à l'écran, pas de blocage dur (si Brevo est down, log et déverrouiller quand même : la capture ne doit jamais casser le produit).

## Critères d'acceptation (testables en parcours utilisateur)
- [ ] Un anonyme génère un patron, le lit intégralement à l'écran sans jamais voir le modal.
- [ ] Au clic sur "Exporter en PDF", il voit le modal, saisit un email valide, et obtient son PDF dans la foulée.
- [ ] Le contact apparaît dans Brevo avec les bons attributs et le bon statut de consentement.
- [ ] Il revient sur `/patron` plus tard (même navigateur) : plus jamais de modal.
- [ ] Un email invalide (`foo@`) est bloqué avec un message d'erreur, en FR et en EN.
- [ ] Un utilisateur connecté exporte le PDF sans voir le modal.
- [ ] `/patron/print` accédé en direct par un anonyme non déverrouillé redirige vers `/patron` (pas de contournement).

## Hors périmètre
- Aucun paywall, aucun pricing, aucune limite du contenu affiché à l'écran.
- Ne pas toucher `/api/analyze`, l'auth, le flux de sauvegarde, ni l'edge function `welcome-email`.
- Pas d'envoi du PDF par email (v2 éventuelle) : le déverrouillage suffit.
- Pas de double opt-in custom (suivi séparément, cf CLAUDE.md follow-up migration).

## Dépendances
Aucun brief en amont. Accès : `BREVO_API_KEY` doit passer dans les env Vercel (à ajouter dans `.env.example` + flag dans la PR pour que Julien l'ajoute côté Vercel avant merge).

## Budget et conditions d'arrêt
- Périmètre attendu : ~6-8 fichiers, zones `app/patron/`, `app/api/subscribe/` (nouveau), `components/`, `lib/i18n.ts`, `.env.example`.
- Modèle d'exécution recommandé : sonnet (périmètre cadré, décisions déjà tranchées).
- Arrêt SUCCÈS : critères verts + `npm run build` propre + PR ouverte.
- Arrêt SUSPENSION : ambiguïté bloquante (l'écrire dans PLAN.md ## Blocages), ou budget dépassé de moitié sans critère vert.

## Vérification
`npm run dev`, jouer le parcours anonyme complet (upload photo test → patron → export), vérifier le contact dans Brevo (dashboard ou API), rejouer en connecté, tester FR et EN via le sélecteur de langue. `npm run build` avant commit.

## Questions ouvertes
- Nom de la liste Brevo cible (créer une liste dédiée "la-maille-audience" par défaut si non précisé).
