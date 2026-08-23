# Recette calculateur v2 - 2026-08-23

## Contexte
- Prod https://la-maille.com, navigateur intégré, anonyme.
- Au chargement : localStorage contenait déjà un projet "lamaille_current_project" (raglan, M, patron généré 12:20 UTC) d'une session précédente sur cette machine. Modale "Project in progress" affichée par-dessus ma zone d'upload.

## Journal

### Analyse 1/6 : raglan (raglan-sleeve-sweater-example.webp), 17 s
Analyse : pull, top-down 70 %, ras-du-cou, bordure relevée côtes 1x1, raglan, jersey, fit oversized (ease 14). Textes d'analyse en français dans l'UI EN.

M 96 (ease 14, 22/30) : CO 70 (1+1+14+1+36+1+14+1+1), augm. tous les 2 tours x36 puis 3 tours x1, manches figées à 66 dès le 27e tour, séparation 110 dos + 110 devant + 4 raglan + 2x10 dessous de bras = 244 ; manches 66+10 = 76 = 34 cm biceps. Corps 95 + 15 côtes = 110 rangs. Total 77+110 = 187 rangs = 62,3 cm OK. Manche 120 rangs = 40 cm = 60 - 20,1 (emmanchure nominale) alors que l'empiècement réel fait 25 cm (76 rangs, warning "deepened"). Bordure encolure 94 m, calcul affiché "40.8 cm × 22/10 × 0.9 = 80.84 -> 94".
XS 82 : CO 62, 212 m corps, manches 66, poignet 36, bordure 82 (calc 73.8 -> 82). Total 67+108 = 175 rangs = 58,3 cm OK. Empiècement 22 cm vs emmanchure nominale 18,4.
XXL 124 : CO 82, 304 m corps, manches 96, poignet 48, bordure 112 (calc 93.8 -> 112). Empiècement 96 rangs = 32 cm (nominal 23,7). Manche 118 rangs = 39,3 cm.
Custom 36/50, 82 cm, ease 0 : CO 92, corps 296, manche 108 -> 60, bordure 126 (calc 116.3 -> 126), empiècement 104 rangs = 20,8 cm sans warning (nominal 92 rangs). Total 276 rangs = 55,2 cm OK.
Custom 10/15, 130 cm, ease 20 : CO 44, corps 152, manche 46 -> 24, bordure 58 (calc 44 -> 58), empiècement 48 rangs = 32 cm. Total 106 rangs = 70,7 OK.

BUG Refine panel (/patron) : cliquer XS/S/XXL affiche "Based on size XXL (customized) / Finished chest : 110 cm" : mesures inchangées, Regenerate régénère le même patron M.
Schéma SVG : même silhouette corps pour toutes les pièces, 3e cote toujours "20.0 cm", 4e cote = 30 % de la largeur.
Laine : M DK "239-293 g" et "Yarn needed 83-106m" ; custom 36/50 82 cm "491-601 g" / "159-203m" ; bulky 150 cm FR "83-101 g" / "28-36m".
i18n : UI EN avec "Monter / mailles / Tricoter / rangs au total / Schéma / Masquer / Rang / Voir les calculs / Résultat :" en FR ; toast "Patron généré avec succès !" en EN ; html lang reste "en" en FR.
Email gate PDF : /api/subscribe 200 avec julien+recette-calc@zakoian.com (newsletter décochée). PDF react-pdf A4 7 pages, généré côté client, 21,6 Ko. Footer "la-maille.vercel.app", "dk" minuscule, "92m environ", "Débutant / 12-18h / Taille XXL" sur la couverture, assemblage numéroté deux fois ("1- . 1."), warnings absents du PDF, em dash avant "Dominique de La Maille".
Print : window.print() appelé, document print dédié complet (toutes pièces + warnings), accents manquants ("Echantillon", "Genere", "Materiel necessaire").
