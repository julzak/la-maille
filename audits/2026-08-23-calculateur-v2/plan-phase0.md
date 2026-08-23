# Plan de test orchestrateur (phase 0), calculateur v2 en prod

Photos disponibles (hébergées sur la-maille.com) :
- /images/blog/raglan-vs-set-in-sleeves-which-to-choose/raglan-sleeve-sweater-example.webp (raglan ras du cou)
- /images/blog/raglan-vs-set-in-sleeves-which-to-choose/setin-sleeve-sweater-example.webp (manches montées)
- /images/blog/raglan-vs-set-in-sleeves-which-to-choose/drop-shoulder-construction.webp (épaules tombantes)
- /images/blog/modele-tricot-gilet-femme-facile-gratuit/modele-tricot-gilet-femme-facile-gratuit-gilet-sans-manche.webp (gilet sans manches)
Pas de photo de cardigan dans le repo : famille couverte par le harnais uniquement.

1. Raglan, M, jauge par défaut : empiècement cohérent, corps = cible, manches = biceps, pas de nombre négatif / zéro / non entier.
2. Manches montées, S, échantillon fin (28 m) : épaules dos = devant, dessous de bras manche = corps, encolure dos > 0.
3. Épaules tombantes : manche à haut droit, pas de tête de manche.
4. Gilet sans manches : bordures d'emmanchures, pas de pièce manche.
5. Mesures personnalisées extrêmes (carrure 60 / poitrine 82 ; corps 40 cm) : avertissement, pas de crash, pas de négatif.
6. Export PDF et impression : même contenu que l'écran.
7. Bascule FR/EN : instructions traduites, pas de mélange.
8. Sauvegarde + réouverture : NON JOUABLE (pas de compte de test, création de compte interdite en automatisation).
9. Anonyme : rate limit / email gate toujours fonctionnels après plusieurs générations.
