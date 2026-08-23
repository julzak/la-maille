# Contre-recette 2 : calculateur v2 en prod (la-maille.com)

Date : 2026-08-23, environ 16h00 à 16h30 (heure de Paris).
Testeur : externe, navigateur intégré, session anonyme (aucun compte, aucune connexion).
Échantillon utilisé partout : 22 m x 30 rg / 10 cm, aiguilles 4 mm, DK.

## Conditions de test et limites

- Le quota anonyme (5 analyses / 24 h / IP) était déjà consommé sur cette machine : la seule analyse réelle tentée (photo drop shoulder) a été refusée par le quota. Tout ce qui touche à la classification IA et aux textes libres de l'analyse est donc **non vérifiable** dans cette session.
- Les patrons ont été produits de deux façons : (a) via le panneau "Affiner mon patron / Refine my pattern" sur le projet cardigan déjà présent dans le navigateur (analyse simulée d'une recette précédente : cardigan col V, manches montées, 6 boutons), (b) en écrivant `sessionStorage["lamaille-storage"].state.analysis` (drop shoulder, raglan top-down, sans manches) puis en rechargeant `/analyse` et en cliquant la taille M. Ce sont des simulations, signalées comme telles.
- Le PDF a été intercepté côté client (patch de `URL.createObjectURL`) et son texte extrait en décompressant les flux FlateDecode dans la page. Les dimensions et le contenu textuel sont confirmés ; la mise en page visuelle des pages PDF n'a pas été vue.
- Le projet local "Cardigan" présent dans le navigateur (donnée de test d'une recette précédente) a été écrasé en choisissant "Nouveau projet" pour tenter l'analyse réelle. Aucune donnée serveur touchée.

## Verdict par point

### 1. Panneau Affiner : taille + Régénérer : CORRIGÉ

Cardigan (pièces assemblées, manches montées), échantillon 22/30.

| Taille | Mesures appliquées (store) | Dos montage | Devant montage | Manche montage | Rangs dos |
|---|---|---|---|---|---|
| M (départ) | poitrine 96, corps 62, épaules 43, bras 60, poignet 17, biceps 30, hanches 102, aisance 8 | 114 | 58 | 44 | 186 |
| XS | poitrine 82, corps 58, épaules 38, bras 58, poignet 15, biceps 26, hanches 88, aisance 8 | 100 | 50 | 36 | 174 |
| L | poitrine 104, corps 64, épaules 46, bras 61, poignet 18, biceps 33, hanches 110, aisance 8 | 124 | 62 | 44 | 192 |
| Perso (poitrine 100 via "Personnaliser les mensurations") | poitrine 100, reste M | 120 | | | |

Le panneau affiche bien "Base taille XS, Poitrine finie : 90 cm" avant régénération, "Taille calculée ~90 / ~104 / ~112 / ~108 cm" après. Les presets sont appliqués et le patron change. Observation annexe : la manche XS passe à 36 m. (16,4 cm de poignet pour 15 + 2 cm d'aisance), cohérent.

### 2. Estimation de laine : CORRIGÉ

| Cas | Écran "Laine nécessaire" | Écran grammes | PDF matériel |
|---|---|---|---|
| Cardigan M, manches montées | 862-1101 m | 371-453 g | 862-1054 m (371-453 g) |
| Cardigan XS | 715-913 m | 307-375 g | non généré |
| Cardigan L | 950-1214 m | 409-499 g | non généré |
| Pull M drop shoulder (aisance 14) | 852-1089 m | 366-448 g | non généré |
| Pull M raglan top-down | 821-1049 m | 353-431 g | non généré |
| Pull M sans manches | 547-699 m | 235-287 g | 546-668 m (235-287 g) |

Ordres de grandeur réalistes (pull adulte M DK : 800 à 1 100 m, 350 à 450 g), le sans-manches demande nettement moins. `pattern.estimatedYardage` vaut 412 pour le cardigan M (c'est maintenant une valeur en grammes, pas en mètres ; le nom du champ est trompeur mais sans effet visible).

Réserve : la borne haute des mètres diffère entre l'écran et le PDF (1101 vs 1054 m, 699 vs 668 m). Voir finding F3.

### 3. Schémas cotés : PARTIELLEMENT CORRIGÉ

Vérifié sur le SVG rendu (chemins et cotes), rendu local pour contrôle visuel.

- Dos (panneau, cardigan M) : largeur 51,8 cm (114 m. / 2,2), longueur 62,0, profondeur d'emmanchure 20,1, encolure 16,3. Cotes = calculs affichés ("Carrure 43 cm × 22/10 = 96", "Profondeur d'emmanchure 20.1 cm × 30/10 = 60"). Le tracé respecte les proportions (emmanchure 80 px = 20,05 cm, carrure 172 px = 43 cm, encolure 65 px = 16,3 cm). XS donne 45,5 / 58,0 / 18,4 / 14,4 : les profondeurs varient bien avec la taille, plus de 20 cm fixe. OK.
- Dos et devant drop shoulder : rectangle 55,5 x 62,0 (courbes dégénérées), encolure devant 7 cm tracée. OK.
- Empiècement raglan : trapèze, encolure 15,9 cm en haut, 51,8 cm en bas, profondeur 23,3 cm, manche "35 cm". OK.
- Corps raglan : rectangle 51,8 x 38,7. OK.
- Bordures (encolure, bandes de boutonnage, bandes d'emmanchure) : `schematic.kind = "none"`, aucun schéma rendu. OK.
- Manche montée : trapèze 20,0 cm poignet, 34,5 cm haut, 53,3 cm long, avec tête de manche arrondie. Forme OK, mais la tête dessinée fait 8,6 cm alors que les instructions donnent "Hauteur de tête : 13 cm" (40 rangs). Mineur.
- **Devant de cardigan col V : tracé faux** (finding F1). Le bord devant monte jusqu'au sommet (y=40) puis redescend de 18,6 cm avant de remonter en courbe vers l'épaule : cela dessine une languette verticale de 4 cm de large qui dépasse l'épaule de 5 cm, et un "crochet" à la place du V. Épaule tracée à 11 cm au lieu de 13,4 cm (carrure 43 moins encolure 16,3, divisé par 2), emmanchure tracée 15 cm au lieu de 20,05. Une seule cote de largeur et une de longueur (26,4 / 62,0), ni profondeur d'emmanchure ni profondeur de V (17 cm dans `schematic.necklineDepthCm`).
- **Manche drop shoulder : tête de manche dessinée** alors que les instructions disent "Rabattre les 88 m. souplement (haut de manche droit, largeur 40 cm)" (finding F2). Tracé `M 80 256 L 40 80 Q 64 40 120 40 Q 176 40 200 80 L 160 256`, soit une tête arrondie de 10 cm sur une longueur totale 54 cm ; l'utilisateur lit donc 44 cm de poignet à l'aisselle pour 54 cm dans les instructions.
- **Manche raglan (en rond, top-down) : même tête arrondie fictive** (4,3 cm) et largeur cotée 17,3 cm (demi-circonférence) alors que l'empiècement cote la même manche "35 cm" et que les instructions disent 76 m. = 34,5 cm (finding F2).

### 4. Interface EN / FR : CORRIGÉ avec réserves

- `<html lang>` : "fr" puis "en" après le switch, puis "fr" à nouveau. Cookie `lamaille-lang` suit. OK.
- Cartes de pièces en EN : "Cast on / 114 / stitches", "Knit / 186 / rows total", "Schematic", "Hide", "Rows 1-15", "Row 127", "See calculations (5)", "Result: 228.80 → 228", "Rounded from 228.80 to 228". En FR : "Monter / mailles", "Tricoter / rangs au total", "Schéma", "Masquer", "Rangs", "Voir les calculs (5)", "Résultat :". OK.
- Instructions traduites dans les deux sens avec les mêmes nombres (Dos 114 m. / 186 rangs, "Rabattre les 36 m. centrales ... (10, 10, 10 m.)" = "bind off the center 36 sts ... (10, 10, 10 sts)"), même estimation laine (862-1101 m, 371-453 g). OK.
- Toast de première génération en EN : "Pattern generated!". OK.
- Réserves :
  - L'en-tête de chaque carte de pièce affiche "114 m." en EN ("Back 114 m.", "Sleeve (x2) 44 m."), abréviation française (finding F6).
  - Le toast après "Regenerate pattern" affiche "Regenerate pattern" (EN) / "Régénérer le patron" (FR), c'est le libellé du bouton, pas "Pattern generated!" (finding F5).
  - Le toast d'erreur d'analyse a pour titre "Erreur d'analyse" en UI anglaise (finding F4).
  - Page /analyse en EN : badge "Analyse fiable" en français ; modale "Project in progress" en EN avec le statut "Patron genere" (français, sans accents) ; en FR la date de la modale est "Aug 23, 03:27 PM" (finding F7).
  - Textes libres de l'analyse (reasoning, limitations) dans la langue de l'UI : **non vérifiable** (quota). Sur l'ancien projet, les limitations en français restent en français après passage en EN, ce qui est attendu.

### 5. Analyse photo drop shoulder : NON VÉRIFIABLE

Upload de `/images/blog/raglan-vs-set-in-sleeves-which-to-choose/drop-shoulder-construction.webp` (145 344 octets, image/webp) puis "Analyze" : réponse après environ 30 s, "You've reached today's limit of 5 free analyses. Create a free account to get 15 analyses per day." Quota déjà consommé avant la session, aucune analyse réelle possible.

Ce qui a pu être vérifié en simulant `sleeves.type = "marteau"` + `construction = "pieces-assemblees"` :
- Libellé d'analyse : "Drop shoulder - Long" (EN). OK.
- Patron M (aisance 14 car fit oversized) : Dos et Devant 122 m. rectangulaires sans façonnage d'emmanchure ("Place a marker at each side ... armhole start (drop shoulder, no shaping)"), manche 44 → 88 m. sur 161 rangs puis "Bind off the 88 sts loosely (straight sleeve top, width 40 cm = 2 × armhole depth)", assemblage "Sew the sleeve tops flat between the armhole markers". Manche à haut droit sans tête de manche : OK côté instructions.
- Longueur manche poignet-aisselle 54 cm = 60 (bras) moins le débord d'épaule (55,5 - 43) / 2 = 6,2 cm. Cohérent.
- Incohérence : les calculs du Dos affichent "Cross back 43 cm × 22/10 = 96" et "Finished upper arm 34.0 cm × 22/10 = 76" alors que le patron drop shoulder n'utilise ni 96 ni 76 (épaules = 122 m. pleine largeur, haut de manche = 88 m.). Voir finding F8.

### 6. PDF : CORRIGÉ avec réserves

Cardigan M en EN (9 pages) et pull sans manches M en FR (7 pages).

- Format : `/MediaBox [0 0 595.28 841.89]` sur toutes les pages = A4. OK.
- Pied de page : "la-maille.com" + numéro de page sur chaque page, aucune occurrence de "vercel". OK.
- Couverture EN : "LA MAILLE / your French knitting studio / Cardigan / Custom pattern generated by La Maille / Beginner / Size chest 104 cm / ... / Created on 8/23/2026". Couverture FR : "Pull / Patron sur-mesure généré par La Maille / Débutant / Taille poitrine 104 cm / Créé le 23/08/2026". Aucune durée estimée. OK. (La tagline "your French knitting studio" reste en anglais sur la couverture FR, cosmétique.)
- Matériel EN : "YARN dk 862-1054 m (371-453 g)", FR : "FIL dk 546-668 m (235-287 g)". Mètres ET grammes présents, grammes identiques à l'écran, **mètres max différents de l'écran** (1101 / 699 à l'écran). Finding F3.
- Aiguilles : EN "4 mm circular 32in", FR "4 mm circulaires 80cm", écran EN "4 mm - circular 80 cm min". Finding F9.
- Avertissements et calculs par pièce, sur la page de la pièce : Back "DIMENSIONS ... Finished chest 104 cm × 22/10 = 228, Cross back 43 cm × 22/10 = 96, Back neck 16.3 ..., Armhole depth 20.1 cm × 30/10 = 60, Finished upper arm 34.0 ..." ; Left front "The front neck starts on row 135, during the armhole shaping: work both at the same time." ; Sleeve "Sleeve cap / armhole check cap edge 22.9 cm vs armhole 22.4 cm (per side) = 0.5" + "Knit 2 identical sleeves." ; Neckband "Neck circumference 55.0 cm × 22/10 × 0.9 = 108" + avertissement col V. OK.
- Assemblage numéroté une seule fois : "1. Block the pieces ... 7. Block finished garment" (EN), "1. Coudre les épaules ... 4. Bloquer" (FR). OK.
- Nombres PDF = nombres écran (114 m., 186 rangs, 58, 44, 108, 102, boutonnières aux m. 3, 22, 41, 60, 79, 98). OK.

## Non-régression

- **Raglan top-down M** (simulé) : montage 70 = 1+1+14+1+36+1+14+1+1. 34 rangs d'augmentation (33 tous les 2 rangs + 1 tous les 3), manches bloquées à 68 à partir du 28e (14 + 2 × 27 = 68), dos 36 + 2 × 34 = 104, devant 2 + 20 + 14 + 68 = 104, séparation 104 + 2 + 8 + 104 + 2 + 8 = 228 = "Finished chest 104 cm × 22/10 = 228". Manches 68 + 8 = 76 m. = 34,5 cm = biceps 30 + 4. Diminutions manche 76 → 44 en 16 rangs de diminution (9 tous les 6 + 7 tous les 7 = 103 rangs = rangs 2-104). Bordure 94 = (70 + 20 + 14) × 0,9. Sommes justes. Avertissement "Yoke deepened to fit 34 increase rounds (large ease): yoke depth 70 rows instead of 68" alors que l'aisance est 8 cm (regular) : formulation douteuse, voir F10.
- **Manches montées** (cardigan M) : dessous de bras 5 m. rabattues des deux côtés, dos 114 - 10 - 8 = 96, épaules (96 - 36) / 2 = 30 = 10 + 10 + 10 ; devant 58 - 5 - 4 = 49, moins 1 m. lisière, moins 18 diminutions de V = 30 = 10 + 10 + 10 ; V sur rangs 135-180 = 13 × 2 + 5 × 4 = 46 rangs ; tête de manche 76 - 10 = 66, moins 2 × (14 + 8) = 22 rabattues, rangs 123-158 = 36. Cohérent. L : 124 - 12 - 10 = 102, (102 - 38) / 2 = 32 = 11 + 11 + 10, rangs 131-162 = 6 × 4 + 8 × 1. Cohérent.
- **Mode Tricot** : Bordure d'encolure "Rang 8/8, 100% terminé, ✓", bouton → désactivé au dernier rang ; Dos "Rang 192/192, 100% terminé, Dos ✓", `lamaille-knitting-progress.pieces.back = {currentRow: 192, completed: true}`. Dernier rang atteignable. OK.
- **FR/EN mêmes nombres** : OK (voir point 4).
- **Impression** : "Imprimer" appelle `window.print()` une fois, feuille de style print présente. OK.
- **Gate email PDF** : déjà déverrouillée dans ce navigateur (`lamaille-email-gate.unlocked = true`), non retestée.

## Findings

### Moyen

- **F1. Schéma du devant de cardigan col V faux.** `kind: "cardigan-front"`, tracé SVG : `M 40 288 L 40 40 L 55.8 40 L 55.8 114.4 Q 55.8 74 82.2 60.5 L 126 60.5 L 126 96.1 Q 145.5 96.1 145.5 120.2 L 145.5 288 Z`. Le bord d'ouverture monte au-dessus de l'épaule (languette 4 cm x 5 cm), le V est remplacé par un crochet, l'épaule mesure 11 cm au lieu de 13,4, l'emmanchure 15 cm au lieu de 20,05. Seules deux cotes (26,4 / 62,0). Observé en M et XS. Les instructions, elles, sont justes.
- **F2. Tête de manche arrondie dessinée sur les manches sans tête.** Drop shoulder : instructions "straight sleeve top, width 40 cm", schéma avec tête de 10 cm. Raglan top-down (manche en rond reprise à l'aisselle) : tête de 4,3 cm dessinée et largeur cotée 17,3 cm (demi-tour) alors que l'empiècement annonce "35 cm" et les instructions 76 m. (34,5 cm). Le schéma de la manche montée, lui, a une tête de 8,6 cm pour 13 cm annoncés.
- **F3. Métrage max écran ≠ PDF.** Cardigan M : écran "862-1101m", PDF "862-1054 m (371-453 g)". Sans manches : écran "547-699m", PDF "546-668 m". Les grammes sont identiques et cohérents avec le PDF (ratio +22 %), c'est la borne haute des mètres à l'écran (+27,7 %) qui est hors ligne. Probablement deux calculs séparés.
- **F4. Erreur de quota présentée comme un problème de photo.** Sous UI EN : carte "Hmm, I couldn't read this one" + "Tips for a good photo" + bouton "Try with another photo" pour un message de quota ("You've reached today's limit of 5 free analyses..."). L'utilisateur est invité à changer de photo alors que c'est inutile. Le toast associé a pour titre "Erreur d'analyse" (français sous UI EN). La carte d'erreur est rendue deux fois sur desktop (1280 px) : une dans la colonne gauche sous la photo (`lg:col-span-2`), une dans la colonne droite (`lg:col-span-3`), toutes deux visibles.

### Faible

- **F5. Toast de régénération = libellé du bouton.** Après "Regenerate pattern" le toast vert affiche "Regenerate pattern" ; en FR "Régénérer le patron". Attendu : "Pattern generated!" / équivalent FR (le toast de première génération, lui, dit bien "Pattern generated!").
- **F6. "m." dans l'en-tête des cartes de pièces en EN** : "Back 114 m.", "Left front 58 m.", "Sleeve (x2) 44 m.", "Neckband 108 m.". Le corps de la carte dit bien "stitches".
- **F7. Résidus de langue sur /analyse et la modale projet** : badge "Analyse fiable" en UI EN ; modale "Project in progress" avec statut "Patron genere" (FR sans accents) ; modale FR avec date "Aug 23, 03:27 PM" ; "Touchez chaque section pour voir les details" (accent manquant) ; "Aiguille a laine" (accent manquant) ; "Confiance de l'analyse : medium" (valeur brute non traduite dans le disclaimer FR) ; "Politique de confidentialite" dans le footer.
- **F8. Calculs non pertinents affichés pour le drop shoulder** : "Cross back 43 cm × 22/10 = 96" et "Finished upper arm 34.0 cm × 22/10 = 76" sur le Dos alors que le patron utilise 122 m. pleine largeur aux épaules et 88 m. en haut de manche (40 cm). Le PDF reprend ces lignes. Idem pour le raglan ("Armhole depth 20.1 cm × 30/10 = 60" alors que l'empiècement fait 70 rangs).
- **F9. Unité des aiguilles incohérente** : PDF EN "4 mm circular 32in", PDF FR "4 mm circulaires 80cm", écran EN "4 mm - circular 80 cm min". Tout le reste du PDF EN est en cm.
- **F10. Avertissement raglan "large ease"** affiché avec aisance 8 cm (regular) : "Yoke deepened to fit 34 increase rounds (large ease): yoke depth 70 rows instead of 68". Le fond est juste (70 rangs nécessaires), la cause annoncée non.
- **F11. Clés de progression Mode Tricot dépendantes de la langue** (assumé, lu dans `lamaille-knitting-progress`) : les pièces standard ont des clés stables (`back`, `front-left`, `sleeve-left`, `neckline`) mais la dernière pièce est stockée sous `bandes-de-boutonnage-(x2)`, slug du nom FR. Un passage en EN créerait `front-bands-(x2)` et ferait perdre la progression de cette pièce. Non testé en runtime.
- **F12. `pattern.estimatedYardage` contient des grammes** (412 pour le cardigan M, 341 en XS) alors que le nom suggère un métrage. Sans effet visible, mais piège pour la suite (PDF, sauvegarde).

### Cosmétique

- Couverture PDF FR : tagline "your French knitting studio" en anglais.
- Niveau "Beginner / Débutant" sur la couverture pour un cardigan col V à manches montées et boutonnières : discutable, mais hors périmètre de la correction.
- Tête de manche montée dessinée à 8,6 cm pour 13 cm annoncés (voir F2).

## Synthèse

Points 1, 2 et 6 corrigés (avec pour 6 l'écart de métrage écran/PDF, F3). Point 4 corrigé sur les libellés de cartes, les calculs, `<html lang>` et le toast de première génération ; restent le toast de régénération (F5), "m." dans les en-têtes (F6), le toast d'erreur en français (F4) et quelques résidus (F7). Point 3 corrigé pour le dos, le devant de pull, l'empiècement raglan, le corps et les bordures ; le devant de cardigan col V est faux (F1) et les manches sans tête ont une tête dessinée (F2). Point 5 non vérifiable (quota), mais la génération drop shoulder simulée donne bien une manche à haut droit. Aucune régression trouvée sur les sommes raglan, les manches montées, le Mode Tricot et l'égalité FR/EN.
