## Contexte du test

**Images de test** : aucune vraie photo utilisateur n'existe dans le repo (pas de fixtures, les uploads vivent dans Supabase Storage). Les 4 images sont tirées des visuels Pinterest de marque (`public/pins/`, générés par gemini-3.1), recadrées pour retirer les bandeaux de texte marketing (sips, crop 1000x930). Ce sont des photos réalistes de tricots (pull torsadé rouille, pull irlandais écru, pull écru plié avec mètre ruban, layette avec cardigan à boutons) mais pas des photos utilisateur réelles : à compléter idéalement avec 2-3 vraies photos d'uploads si un second run est fait.

**Déroulé** : côté Opus 5 exécuté le 2026-08-06 au matin ; côté Kimi K3 complété le même jour une fois la clé Moonshot posée dans `~/.config/moonshot/key`. Les deux côtés sont en cache dans `tasks/ab-kimi-results/` : relancer le script ne refacture rien, ajouter une image dans le dossier ne facture que les nouveaux appels.
