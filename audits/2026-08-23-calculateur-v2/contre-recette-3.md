# Contre-recette 3 : correctif schémas / quota / métrage en prod (la-maille.com)

Date : 2026-08-23, environ 16h30 à 16h50 (heure de Paris).
Testeur : externe, navigateur intégré, session anonyme (aucun compte, aucune connexion, aucune donnée serveur touchée).
Échantillon partout : 22 m x 30 rg / 10 cm, aiguilles 4 mm, DK, taille M (poitrine 96, corps 62, épaules 43, bras 60, poignet 17, biceps 30, hanches 102).

## Conditions et limites

- Quota anonyme (5 analyses / 24 h / IP) déjà consommé avant la session : l'analyse réelle tentée (UI EN, photo `drop-shoulder-construction.webp`, 145 344 octets, image/webp) a été refusée. Une seconde tentative en UI FR a servi uniquement à vérifier la localisation du message de quota (refusée aussi, non comptée comme analyse).
- Tout ce qui concerne la classification IA et les textes libres (reasoning, limitations) est donc **non vérifiable**. Les patrons ont été générés en écrivant `sessionStorage["lamaille-storage"].state.analysis` (drop shoulder / cardigan col V manches montées / raglan top-down) puis `/analyse` et clic sur la taille M. Simulations signalées comme telles.
- Les schémas ont été lus dans le DOM (path `d`, `line`, `text`) et contrôlés visuellement en re-rendant les SVG dans la page (captures). Les PDF ont été interceptés côté client (`URL.createObjectURL`) et leur texte extrait en décompressant les flux FlateDecode.

## Verdict par point

### 1. Schéma du demi-devant de cardigan col V : CORRIGÉ

Cardigan M, manches montées, 6 boutons, simulé. `schematic` du devant gauche : `kind: "cardigan-front"`, largeur 26,36, longueur 62, emmanchure 20,05, épaule 21,5 (demi-carrure), encolure 8,17 (demi-encolure dos), profondeur de V 17,04.

Tracé rendu (échelle 4 px/cm, origine x=40, y=40) :
`M 40 288 L 40 108.17 L 72.68 40 L 126 40 L 126 96.14 Q 145.45 96.14 145.45 120.2 L 145.45 288 Z`

- Ouverture (bord gauche) : verticale de y=288 à y=108,17, soit 45 cm depuis le bas = départ du V à 17,04 cm du haut. Les instructions disent "V-neck ... rows 135-180" : 186 - 135 = 51 rangs = 17 cm. Cohérent.
- V en diagonale de (40, 108,17) à (72,68, 40) : 8,17 cm de large = 18 m. de diminutions par côté (instructions "18 sts per side" = 8,2 cm). Cohérent.
- Épaule de x=72,68 à x=126 : 13,33 cm ; encolure + épaule = 86 px = 21,5 cm = demi-carrure (43 / 2). Épaules instructions : 10 + 10 + 10 = 30 m. = 13,6 cm. Cohérent.
- Emmanchure creusée de y=40 à y=120,2 : 20,05 cm = "Armhole depth 20.1 cm × 30/10 = 60" ; retrait horizontal 4,9 cm pour 5 m. rabattues + 4 diminutions = 9 m. = 4,1 cm. Cohérent.
- Cotes affichées : "26.4 cm" (largeur), "62.0 cm" (longueur), "20.1 cm" (emmanchure), "8.2 cm" (encolure, au-dessus du V). La profondeur du V (17 cm) et l'épaule ne sont pas cotées, mais ce n'était pas demandé.
- Dos : encolure arrondie conservée (`Q 117.5 46 143.6 46 Q 169.8 46 176.3 40`), cotes 51,8 / 62,0 / 20,1 / 16,3. Plus de languette ni de crochet (F1 de la contre-recette 2 clos).

### 2. Schéma des manches : CORRIGÉ

| Cas | `capHeightCm` | Tracé | Cotes | Instructions |
|---|---|---|---|---|
| Montées (cardigan M) | 13,33 | `M 69.1 253.3 L 40 93.3 Q 60.7 40 109.1 40 Q 157.5 40 178.2 93.3 L 149.1 253.3 Z` : tête arrondie de 53,3 px = 13,3 cm | 34.5 / 20.0 / 53.3 cm | "Cap height: 13 cm", rangs 121-160 = 40 rangs = 13,3 cm |
| Drop shoulder (pull M) | 0 | `M 80 256 L 40 40 L 200 40 L 160 256 Z` : trapèze, haut droit | 40.0 / 20.0 / 54.0 cm | "Bind off the 88 sts loosely (straight sleeve top, width 40 cm = 2 × armhole depth)", 162 rangs = 54 cm |
| Raglan top-down (en rond) | 0 | `M 54.5 198.7 L 40 40 L 109.1 40 L 94.5 198.7 Z` : trapèze, haut droit | 17.3 / 10.0 / 39.7 cm | 76 m. = 34,5 cm de tour, 119 rangs = 39,7 cm |

La hauteur de tête dessinée est maintenant égale à celle des instructions (8,6 cm pour 13 annoncés dans la contre-recette 2 : clos). Les manches sans tête sont droites (F2 clos). L'empiècement raglan cote la manche "17 cm" et le schéma de manche "17.3 cm" (demi-tour à plat dans les deux cas, contre "35 cm" / "17.3 cm" avant) : cohérents entre eux, voir réserve N4.

### 3. Page /analyse : CORRIGÉ

Quota atteint, UI EN, desktop 1280 px :
- Une seule carte d'erreur dans le DOM (1 seul nœud "Daily limit reached", 382 x 28 px, colonne droite) ; idem à 375 px (1 nœud). Plus de doublon.
- Carte : icône sablier, titre "Daily limit reached", texte "You've reached today's limit of 5 free analyses. Create a free account to get 15 analyses per day.". Aucun "Tips for a good photo", aucun bouton "Try with another photo" (boutons présents : EN/FR, Sign in, Change).
- Toast : "Analysis error" + même message, en anglais.
- UI FR (seconde tentative refusée) : carte "Limite quotidienne atteinte" + "Vous avez atteint la limite de 5 analyses gratuites aujourd'hui. Créez un compte gratuit pour bénéficier de 15 analyses par jour." ; toast "Erreur d'analyse". Le message serveur suit la langue de la requête.
- Badge de confiance : "High confidence" (drop shoulder simulé, EN), "Medium confidence" (cardigan, EN), "Confiance moyenne" (FR). Plus de "Analyse fiable" sous UI EN.
- Modale "Projet en cours" (FR) : "Pull / 23 août, 16:21 / Patron généré" (accent et date FR corrigés).
- Non vérifiable : la carte d'erreur "photo illisible" (avec conseils photo) n'a pas pu être déclenchée faute de quota.

### 4. Métrage écran = PDF : CORRIGÉ

| Patron (M, simulé) | Écran "Yarn needed" | Écran grammes | PDF MATERIALS |
|---|---|---|---|
| Pull drop shoulder (aisance 14) | 852-1089m | 366-448 g | "852-1089 m (366-448 g)" |
| Cardigan col V manches montées | 862-1101m | 371-453 g | "862-1101 m (371-453 g)" |
| Pull raglan top-down | 821-1049m | 353-431 g | non généré |

Aiguilles PDF EN : "4 mm circular 80 cm" (plus de "32in"). Écran EN : "4 mm - circular 80 cm min". Format : `MediaBox [0 0 595.28 841.89]` (A4) sur les 7 / 9 pages, pied "la-maille.com" + numéro.

### 5. Analyse réelle drop shoulder : NON VÉRIFIABLE

Upload puis "Analyze" sous UI EN : réponse "You've reached today's limit of 5 free analyses..." après environ 8 s. Aucune analyse réelle possible dans cette session, classification et textes libres non testés.

Vérifié en simulant `sleeves.type = "marteau"`, `construction = "pieces-assemblees"`, fit oversized : libellé "Drop shoulder - Long", patron M : Dos et Devant 122 m. x 186 rangs sans façonnage ("Place a marker at each side ... armhole start (drop shoulder, no shaping)"), épaules 15 + 14 + 14 = 43 m. par côté, 43 x 2 + 36 = 122 ; devant encolure 22 rabattues + 7 diminutions x 2 = 36 = encolure dos ; manche 44 -> 88 m. (16 x 6 + 6 x 8 + 2 = 146 rangs = rangs 16-161), haut droit 40 cm = 2 x 20 cm d'emmanchure ; assemblage "Sew the sleeve tops flat between the armhole markers". Schéma de manche à haut droit (point 2).

## Non-régression

- **Raglan top-down M** : 70 = 1+1+14+1+36+1+14+1+1 ; 34 tours d'augmentation (33 tous les 2 + 1 tous les 3 = 69 rangs = rangs 2-70) ; manches 14 + 2 x 27 = 68 (bloquées à partir du 28e) ; dos 36 + 68 = 104 ; devant 2 + 20 + 14 + 68 = 104 ; séparation 104 + 2 + 8 + 104 + 2 + 8 = 228 = "Finished chest 104 cm × 22/10 = 228" ; manche 68 + 8 = 76 m. = 34,5 cm ("Finished upper arm 34.0 cm × 22/10 = 76") ; 76 -> 44 en 16 diminutions (9 x 6 + 7 x 7 = 103 rangs = rangs 2-104) ; bordure 94 = (70 + 20 + 14) x 0,9. Sommes justes. L'avertissement est devenu "Yoke deepened to fit 34 increase rounds: 70 rows instead of 68" (mention "large ease" retirée, F10 clos).
- **Manches montées** (cardigan M) : dessous de bras 5 m. rabattues, dos 114 - 10 - 8 = 96, épaules (96 - 36) / 2 = 30 = 10 + 10 + 10 ; devant 58 - 5 - 4 - 1 - 18 = 30 ; tête 76 - 10 = 66, 66 - 2 x (14 + 8) = 22 rabattues, "Sleeve cap / armhole check cap edge 22.9 cm vs armhole 22.4 cm (per side) = 0.5". Inchangé et cohérent.
- **Mode Tricot** (raglan, Bordure d'encolure) : "Neckband • Row 8/8", "⚠️ Bind off on this row", "100% complete", "Neckband ✓", bouton → désactivé ; `lamaille-knitting-progress.pieces.neckline = {currentRow: 8, completed: true}`. Dernier rang atteignable.
- **FR/EN mêmes nombres** (raglan) : EN 70 / 228 / 76 / 94 m., 71 / 116 / 119 / 8 rangs, 821-1049 m, 353-431 g ; FR "Empiècement raglan (top-down) 70 m.", "Corps 228 m.", "Manche (x2, en rond) 76 m.", "Bordure d'encolure 94 m.", 821-1049 m, 353-431 g, "tous les 6 tours, 9 fois, puis tous les 7 tours, 7 fois. On obtient 44 m.". Identiques.

## Findings

Aucune régression trouvée. Restes et nouveautés :

### Moyen

- **N1. Manche montée 6,7 cm trop courte par rapport à la longueur de bras saisie** (assumé, lu dans `lib/shaping.ts:154` et `lib/pattern-calculator.ts`). `underarmToWristCm = armLength - armholeDepthCm` = 60 - 20,05 = 40 cm ("Length from cuff to underarm: 40 cm"), puis tête de 13,3 cm : longueur totale 53,3 cm (cote "53.3 cm" du schéma) pour une longueur de bras "de l'épaule au poignet" de 60 cm. La soustraction utilise la profondeur d'emmanchure (20 cm) au lieu de la hauteur de tête (13,3 cm). Le drop shoulder, lui, tombe juste (54 = 60 - 6,2 de débord). Présent avant le correctif, hors périmètre, mais visible sur le schéma maintenant que la tête est à la bonne hauteur.

### Faible

- **N2. Devant droit = devant gauche sur le schéma.** Les deux SVG sont identiques (ouverture à gauche, V à gauche) ; le devant droit n'est pas en miroir.
- **N3. Boutons du schéma : 5 ellipses pour 6 boutonnières.** Les instructions disent "6 buttonholes ... at sts 3, 22, 41, 60, 79, 98" (bande de 102 m. du bas au départ du V) ; le schéma dessine 5 ellipses (y = 144,8 à 251,4 px, soit de 36 cm à 9 cm du bas), réparties sur une zone plus courte que la bande.
- **N4. Pièces en rond cotées à plat sans le dire.** Raglan : corps "51.8 cm" (228 m. = 103,6 cm de tour), manche "17.3 cm" / "10.0 cm" (76 / 44 m. = 34,5 / 20 cm de tour), empiècement "17 cm" (arrondi différent de "17.3 cm"). Aucune mention "à plat" ou "demi-tour" ; l'utilisateur qui compare avec "Finished upper arm 34.0 cm" ne retrouve pas 17.
- **N5. Toast "Pattern generated!" en anglais** après bascule EN -> FR sur /patron (régénération dans la nouvelle langue, toast dans l'ancienne).
- **F6 (reste). "70 m." dans les en-têtes de cartes en EN** : "Back 122 m.", "Sleeve (x2) 44 m.", "Raglan yoke (top-down) 70 m.". Le corps de carte dit "stitches".
- **F8 (reste). Calculs non pertinents en drop shoulder** : "Cross back 43 cm × 22/10 = 96" et "Finished upper arm 34.0 cm × 22/10 = 76" affichés (écran et PDF page Back) alors que le patron utilise 122 m. aux épaules et 88 m. en haut de manche.

### Cosmétique

- Couverture PDF : "— Dominique from La Maille" (tiret long) et tagline "your French knitting studio" en anglais sur la version FR.
- FR : "Mailles relevees" (accent), "Regular" (coupe non traduite) sur /analyse ; "Tricoter 6 rangs en cotes 1/1" (accent) dans la bordure ; footer "Politique de confidentialite".
- Schéma cardigan : profondeur du V (17 cm) et largeur d'épaule non cotées.

## Synthèse

Points 1, 2, 3 et 4 corrigés en prod avec les nombres ci-dessus : demi-devant col V tracé juste et coté (26,4 / 62,0 / 20,1 / 8,2), dos à encolure arrondie, tête de manche 13,3 cm = instructions, manches drop shoulder et raglan à haut droit, une seule carte "Daily limit reached / Limite quotidienne atteinte" sans conseils photo, badges et toasts localisés, métrage écran = PDF (852-1089 m, 862-1101 m) et "circular 80 cm". Point 5 non vérifiable (quota), la simulation drop shoulder est cohérente. Aucune régression raglan, manches montées, Mode Tricot, FR/EN. Nouveau finding principal : la manche montée est 6,7 cm plus courte que la longueur de bras saisie (N1, assumé par lecture du code).
