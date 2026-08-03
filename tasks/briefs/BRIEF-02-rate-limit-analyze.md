# BRIEF-02 — Garde-fou coûts sur /api/analyze

## Objectif
Un pic de trafic ou un abus ne peut plus faire déraper la facture Anthropic : l'analyse d'image est plafonnée par IP, avec un message clair pour l'utilisateur qui atteint la limite.

## Contexte
- `/api/analyze` (`app/api/analyze/route.ts`) appelle la vision Opus 4.8 (~$0.01-0.05/analyse) sans AUCUN rate limit : seuls des garde-fous de payload existent (5 images max, 10MB/image).
- La table `public.generations` (jazzy-apps) logge déjà chaque appel (best-effort, service_role) : `user_id` nullable, `analysable`, `garment_type`, `num_images`, `model`, `created_at`. C'est le support naturel du compteur : PAS de nouvelle infra (pas d'Upstash, pas de Redis), décision actée.
- Vercel serverless : pas d'état en mémoire fiable. Le comptage se fait par requête SQL sur `generations`.

## Comportement attendu
1. Ajouter une colonne `ip_hash` (hash SHA-256 tronqué de l'IP + sel serveur, jamais l'IP en clair) à `generations`, migration SQL avec rollback documenté.
2. Avant l'appel Anthropic : compter les générations des dernières 24h pour cet `ip_hash` (anonyme) ou ce `user_id` (connecté). Limites par défaut : 5/24h anonyme, 15/24h connecté (constantes nommées, faciles à ajuster).
3. Limite atteinte → HTTP 429 avec message i18n côté client : expliquer la limite, inviter à créer un compte (si anonyme) ou à revenir demain. Jamais d'erreur technique brute.
4. Si le comptage échoue (Supabase down, admin client absent) → laisser passer et logger : le garde-fou ne doit jamais casser le produit.

## Critères d'acceptation (testables en parcours utilisateur)
- [ ] Un anonyme peut faire 5 analyses dans la journée ; la 6e affiche un message clair (FR et EN) l'invitant à créer un compte, sans stack trace ni erreur brute.
- [ ] Un connecté garde sa limite propre (15), indépendante de son IP.
- [ ] Les insertions dans `generations` contiennent `ip_hash` pour les anonymes.
- [ ] La migration SQL est fournie avec son rollback dans le même fichier.
- [ ] Aucune IP en clair nulle part (ni DB, ni logs).

## Hors périmètre
- Ne pas toucher l'UI de `/analyse` au-delà de l'affichage du message 429.
- Pas de tracking de coût en dollars/tokens (chantier séparé si besoin).
- Pas de CAPTCHA, pas de nouvelle dépendance.
- Ne pas toucher le prompt d'analyse ni `lib/anthropic.ts` (sauf point d'insertion du check si c'est le bon endroit).

## Dépendances
Aucun brief en amont. Accès : migration à appliquer sur jazzy-apps (`vpmmobouujkknustjlho`) avant merge.

## Budget et conditions d'arrêt
- Périmètre attendu : ~4-5 fichiers, zones `app/api/analyze/`, `app/analyse/page.tsx` (message 429), `lib/i18n.ts`, un fichier de migration SQL.
- Modèle d'exécution recommandé : sonnet (logique simple, bien spécifiée ; la migration est triviale et fournie avec rollback).
- Arrêt SUCCÈS : critères verts + `npm run build` propre + PR ouverte.
- Arrêt SUSPENSION : ambiguïté bloquante ou budget dépassé de moitié sans critère vert.

## Vérification
En local : abaisser temporairement la limite à 2, jouer 3 analyses anonymes, vérifier le 429 et le message FR/EN, vérifier `ip_hash` en base. Remettre la limite avant commit. `npm run build`.

## Questions ouvertes
- Valeurs finales des limites (5/15 par défaut, Julien peut ajuster à la review de PR).
