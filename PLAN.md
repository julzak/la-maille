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

## Blocages

(aucun)
