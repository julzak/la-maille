# PLAN — Chantiers croissance La Maille

*Voir VISION.md pour le pourquoi. Ce fichier est l'état partagé consommé par les agents d'exécution.*

## Séquence et dépendances

```
BRIEF-01 capture-email      ──┐  (indépendant, prioritaire)
BRIEF-02 rate-limit-analyze ──┤  (indépendant, prioritaire)
BRIEF-04 seo-quick-wins     ──┤  (indépendant, parallélisable)
                              │
BRIEF-03 pages-patrons-publiques  (après BRIEF-01 : réutilise l'infra email/CTA)
BRIEF-05 test-pinterest           (indépendant, livrable contenu, pas de code app)
```

- 01 et 02 touchent des zones disjointes (`/patron` vs `/api/analyze`) : parallélisables.
- 03 est le plus gros et le plus délicat (migration + RLS) : ne pas le lancer avant que 01 soit mergé.
- 05 ne touche pas l'app : peut se faire n'importe quand.

## Actions hors code (Julien)

- [ ] Request Indexing GSC des 14 articles FR (en attente depuis le chantier blog FR).
- [ ] Publier les pins du BRIEF-05 sur un compte Pinterest La Maille (création du compte incluse).
- [ ] Valider fonctionnellement chaque chantier en prod après merge.

## État

- BRIEF-01-capture-email — mergé (PR #15, vérifié en prod le 2026-08-03 : contact Brevo créé, logs Vercel sans erreur)
- BRIEF-02-rate-limit-analyze — mergé (PR #14, vérifié en prod le 2026-08-03 : ip_hash loggé, migration appliquée sur jazzy-apps)
- BRIEF-03-pages-patrons-publiques — mergé (PR #18, migration appliquée sur jazzy-apps le 2026-08-05, RLS vérifiée : requête anonyme directe = 0 ligne sur 37 patrons privés)
- BRIEF-04-seo-quick-wins — mergé (PR #13, correction : /photo-to-knitting-pattern retiré du sitemap, c'est un redirect 308)
- BRIEF-05-test-pinterest — mergé (PR #17, kit dans tasks/pinterest-test/ ; publication des pins côté Julien)

## Chantier accessoires (décidé 2026-09-25)

```
Lot 0 generations.analysis (PR #55) ─> BRIEF-06 bonnet + socle ─> BRIEF-07 écharpe
                                                               └─> BRIEF-08 chaussettes
```

- Principe acté : le modèle analyse, le code calcule. Aucun chiffre de patron produit par le LLM.
- BRIEF-07 et BRIEF-08 dépendent du socle de BRIEF-06, ordre entre eux selon la demande mesurée par le lot 0.
- Pages SEO accessoires : lot à cadrer après BRIEF-08.

- Lot 0 : mergé (PR #55, migration `generations.analysis` appliquée par Julien le 2026-09-25, colonne vérifiée en prod)
- BRIEF-06-bonnet : mergé et déployé (PR #56, 2026-09-25). Reste : recette Julien sur un vrai bonnet en prod, lire `generations.analysis` des premiers bonnets
- BRIEF-07-echarpe : à faire
- BRIEF-08-chaussettes : à faire

## Blocages

(aucun)
