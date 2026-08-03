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

- BRIEF-01-capture-email — à faire
- BRIEF-02-rate-limit-analyze — à faire
- BRIEF-03-pages-patrons-publiques — à faire
- BRIEF-04-seo-quick-wins — à faire
- BRIEF-05-test-pinterest — à faire

## Blocages

(aucun)
