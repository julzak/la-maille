# BRIEF-04 — SEO quick wins (sitemap, hreflang, hygiène)

## Objectif
Les pages existantes sont toutes correctement déclarées à Google et les paires d'articles FR/EN se référencent mutuellement : capitaliser sur la position moyenne 11.3 sans écrire de nouveau contenu.

## Contexte
- `app/sitemap.ts` (dynamique) n'inclut PAS `/photo-to-knitting-pattern` alors que la page existe et est indexable. `/tricot` est volontairement disallow dans `robots.txt` : ne PAS l'ajouter.
- `lib/blog-data.ts` : 43 articles (27 EN, 16 FR). Le champ `translationSlug` existe et alimente le hreflang dans `app/blog/[slug]/page.tsx:59-65`, mais il est renseigné sur ZÉRO article.
- Piège : les 16 articles FR ont été générés indépendamment des EN. Il ne faut lier que de VRAIES paires équivalentes (même sujet traité). Une paire forcée entre deux articles différents est pire que pas de hreflang.
- `lib/blog-data.ts.backup` (385 Ko) traîne à la racine de `lib/`, non tracké : à supprimer (hygiène).
- Fichier volumineux (~822 Ko) : travailler par edits ciblés, ne jamais réécrire le fichier entier.

## Comportement attendu
1. Ajouter `/photo-to-knitting-pattern` au sitemap.
2. Cartographier les 16 articles FR contre les 27 EN : pour chaque équivalence RÉELLE de sujet, renseigner `translationSlug` dans les DEUX sens. Lister dans la PR les articles FR restés sans paire (c'est une info, pas un échec).
3. Vérifier que le hreflang rendu est correct sur une paire (balises `alternates.languages` dans le HTML).
4. Supprimer `lib/blog-data.ts.backup`.

## Critères d'acceptation (testables en parcours utilisateur)
- [ ] `/sitemap.xml` contient `/photo-to-knitting-pattern` et toujours toutes les entrées précédentes.
- [ ] Chaque paire FR/EN identifiée rend des balises hreflang réciproques dans le HTML des deux articles.
- [ ] Aucun `translationSlug` ne pointe vers un slug inexistant (vérification exhaustive).
- [ ] La PR liste les paires créées et les articles sans équivalent.
- [ ] `lib/blog-data.ts.backup` n'existe plus.

## Hors périmètre
- Aucune réécriture de contenu d'article, aucun nouvel article.
- Ne pas toucher `robots.txt`, ne pas indexer `/tricot`, `/analyse`, `/patron`.
- Pas d'optimisation de titles/CTR (nécessite l'export GSC par requête : chantier ultérieur avec les données).

## Dépendances
Aucune.

## Budget et conditions d'arrêt
- Périmètre attendu : ~3 fichiers (`app/sitemap.ts`, `lib/blog-data.ts`, suppression du backup).
- Modèle d'exécution recommandé : sonnet (le mapping des paires demande du jugement sémantique ; le reste est mécanique).
- Arrêt SUCCÈS : critères verts + `npm run build` propre + PR ouverte.
- Arrêt SUSPENSION : ambiguïté bloquante ou budget dépassé de moitié sans critère vert.

## Vérification
`npm run build` puis inspection du HTML généré (`curl` local) sur `/sitemap.xml` et deux articles appariés. Script de vérification jetable autorisé pour contrôler l'intégrité des `translationSlug` (le supprimer ensuite ou le mettre en `scripts/diag-*`).

## Questions ouvertes
(aucune)
