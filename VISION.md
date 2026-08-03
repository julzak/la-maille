# VISION — La Maille : de la traction SEO à une audience

*Rédigé le 2026-08-03. Stable : ne change que si la stratégie change.*

## Le constat (mesuré, pas supposé)

- Acquisition en accélération : 23.6K impressions Google sur 3 mois, position moyenne 11.3, courbe en forte hausse depuis mi-juin (effet blog FR + EN).
- Produit qui intrigue : 186 générations de patrons anonymes sur les 30 derniers jours via le parcours photo → analyse → patron.
- Funnel percé : 6 comptes créés sur 30 jours, 2 utilisateurs connectés actifs, 61 comptes au total.
- Cause identifiée : le patron complet est gratuit, imprimable et exportable en PDF sans donner ni email ni compte. Il n'existe aucune raison de s'identifier, et aucune capture d'email nulle part sur le site.

## L'objectif (validé par Julien, 2026-08-03)

**Audience d'abord.** Maximiser emails capturés, comptes créés et notoriété. La monétisation sera décidée plus tard. Les coûts API Anthropic sont un garde-fou, pas une contrainte d'optimisation.

## La stratégie

1. **Convertir avant d'amplifier.** Le trafic existant part en fumée : on installe la capture au moment de valeur (le patron généré) avant d'investir dans plus de trafic. Décision actée : le patron reste lisible à l'écran gratuitement, l'export PDF demande un email (liste Brevo), le compte reste optionnel.
2. **Protéger la marge d'erreur.** Chaque génération anonyme coûte de l'argent (vision Opus). Un rate limit simple par IP borne le coût d'un pic de trafic ou d'un abus, sans dégrader l'usage normal.
3. **Transformer l'usage en actif SEO.** Les patrons sauvegardés deviennent, sur consentement, des pages publiques indexables avec OG image : du SEO programmatique auto-alimenté par l'usage. Ce n'est PAS une "boucle virale" (2 users actifs ne propagent rien) : c'est du contenu indexable gratuit.
4. **Capitaliser sur la position 11.3.** Quick wins techniques (sitemap incomplet, zéro paire hreflang FR/EN) avant de produire du contenu neuf.
5. **Tester Pinterest à la main.** Canal naturel du tricot, testé avec ~25 pins manuels et des liens UTM. Automatisation seulement si le test draine du trafic mesurable.

## Ce qu'on ne fait PAS (et pourquoi)

- Pas de paywall ni de pricing : objectif audience, pas revenu.
- Pas de "growth hacking" viral (partage incité, referral) : pas de masse critique pour le propager.
- Pas de pipeline Pinterest automatisé avant preuve que le canal fonctionne.
- Pas de nouveau contenu blog massif tant que l'existant n'est pas indexé et optimisé (Request Indexing GSC toujours en attente côté Julien).
- Pas de nouvelle infra (Upstash, Redis, etc.) : tout se fait avec Supabase + Brevo + Vercel existants.

## Métriques de succès (90 jours)

- Emails capturés : 0 → objectif 40+/mois (vs 186 générations/mois actuelles).
- Comptes créés : 6/mois → 15+/mois.
- Pages patrons publiques indexées : 0 → premières impressions GSC mesurables.
- Coût API : borné par le rate limit, jamais un incident.
