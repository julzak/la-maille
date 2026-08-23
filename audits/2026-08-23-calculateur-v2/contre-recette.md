# Contre-recette calculateur v2, prod la-maille.com, 2026-08-23 (après PR #37)

Testeur : agent externe, navigateur intégré, session anonyme (aucun compte, aucune connexion, aucun email saisi, aucune donnée modifiée côté serveur). Tous les nombres ci-dessous sont lus dans `sessionStorage.lamaille-storage` (pattern.pieces[].instructions, totalRows, warnings) sur la prod, et recoupés avec le DOM de /patron : ce sont des valeurs confirmées, pas déduites du code.

## Limite importante : aucune analyse photo réelle

La première tentative d'upload (raglan-sleeve-sweater-example.webp, 131 Ko, fetch + DataTransfer + clic "Analyze") a été refusée : "You've reached today's limit of 5 free analyses" (429, limite anonyme par IP sur 24 h, la recette précédente et une session antérieure sur cette machine ont consommé le quota). Créer un compte étant interdit, **toutes les configurations ci-dessous sont des simulations** : analyse injectée dans `sessionStorage.lamaille-storage` (state.analysis avec les champs garment / sleeves / neckline / closure / construction / neckband / fit), rechargement de /analyse, puis choix d'une taille ou "Customize measurements". Le calculateur exécuté est celui de la prod ; seule l'étape d'analyse IA est court-circuitée. Les points qui dépendaient d'une vraie photo (reconnaissance col V sur le gilet, raglan sur la photo blog) ne sont donc pas recontrôlés.

Configurations jouées (12 générations, échantillon 22 m / 30 rg sauf mention) :
raglan pull ras-du-cou M / XS / XXL ; gilet sans manches col V M / XS ; cardigan manches montées col V M ; cardigan manches montées ras-du-cou S ; pull manches montées col V L, M en 10 m / 15 rg, XXL en 36 m / 50 rg ; cardigan raglan col V M ; pull épaules tombantes M. UI EN puis FR.

## 1. Les 8 points de la première recette

| # | Point | Verdict |
|---|---|---|
| 1 | Col V devant plus long que le dos | **Corrigé** |
| 2 | Manche raglan calculée avec l'emmanchure nominale | **Corrigé** |
| 3 | Demi-devants cardigan : rang manquant, montage impair | **Corrigé** (avec réserve sur les côtes 2/2) |
| 4 | Grammaire "1 times", "1 rangs", "1 rows" | **Corrigé** |
| 5 | Intervalles impairs à plat | **Corrigé** |
| 6 | Calcul affiché de la bordure d'encolure raglan | **Corrigé** |
| 7 | totalRows bordure d'encolure | **Corrigé** sur la bordure d'encolure, **non corrigé** sur les bandes d'emmanchure et de boutonnage (même défaut) |
| 8 | Bande de boutonnage col V arrêtée au départ du V | **Corrigé** sur cardigan à manches montées, **cassé** sur cardigan raglan |

### Point 1 : col V "en même temps". Corrigé.

Gilet sans manches col V, M (96 + 8 d'aisance, 22/30) :
- Dos, 186 rangs : "[127-128] Armholes: bind off 5 sts at the beginning of the next 2 rows." / "[129-158] Decrease 1 st each side every 6 rows, 1 time, then every 8 rows, 3 times. 96 sts remain." / "[159-180] Continue straight for 22 rows on 96 sts." / "[181-186] Back neck and shoulders: bind off the center 36 sts, then on each side bind off the shoulder sts in 3 steps (10, 10, 10 sts) at the beginning of armhole-side rows."
- Devant, 186 rangs : mêmes rangs 1 à 158, puis "[135-180] At the same time as the armhole decreases: V-neck: Divide the work at the center and finish each side separately. At the neck edge, decrease 1 st every 2 rows, 13 times, then every 4 rows, 5 times (18 sts per side)." / "[181-186] Shoulders: bind off the shoulder sts in 3 steps (10, 10, 10 sts) at the beginning of armhole-side rows." Warning de pièce : "The front neck starts on row 135, during the armhole shaping: work both at the same time."
- Arithmétique : 114 - 10 - 8 = 96 = 2 x 30 + 36 ; 13 x 2 + 5 x 4 = 46 rangs = 135 à 180 ; 18 par côté = 36 / 2 ; 186 rangs = 62,0 cm = longueur de corps M.
- XS : dos et devant 174 rangs (58 cm), V au rang 127 ("every 2 rows, 11 times, then every 4 rows, 5 times (16 sts per side)"), épaules 169-174 des deux côtés, 100 - 8 - 8 = 84 = 2 x 26 + 32, épaules 9/9/8.
- Pull manches montées col V L : dos et devant 192 rangs, V au rang 139, épaules 187-192 des deux côtés. Idem en 10/15 (93 rangs, V au rang 68) et en 36/50 XXL (340 rangs, V au rang 239, 24 x 2 + 12 x 4 = 96 rangs = 239 à 334).

Réserve : le "en même temps" est correct dans le patron complet, mais il casse le mode Tricot (voir R1 ci-dessous).

### Point 2 : longueur de manche raglan. Corrigé.

- M : "Yoke depth: 25 cm (76 rows)", warning "Yoke deepened to fit 37 increase rounds (large ease): yoke depth 76 rows instead of 68." Manche : "[2-98] Decrease 1 st on each side of the marker every 6 rounds, 15 times, then every 7 rounds, 1 time. 44 sts." note "Length from underarm to cuff: 38 cm. Decrease with SSK before marker and K2tog after." puis "[99-113] Cuff: Work 15 rows in 2x2 rib on 44 sts." totalRows 113 = 37,7 cm. Attendu 60 - (25,3 - 3) = 37,7. Avant : 120 rangs / 40 cm.
- XS : empiècement 22 cm (66 rangs), manche 117 rangs = 39 cm, note "Length from underarm to cuff: 39 cm" ; attendu 58 - (22 - 3) = 39.
- XXL : empiècement 32 cm (96 rangs), manche 102 rangs = 34 cm, note "34 cm" ; attendu 63 - (32 - 3) = 34. Avant : 118 rangs / 39,3 cm.
- Cardigan raglan M (aisance 8) : empiècement 23 cm (70 rangs), manche 119 rangs, note "Longueur du dessous de bras au poignet : 40 cm" ; attendu 60 - (23,3 - 3) = 39,7.
- Invariants raglan tenus : M montage 70 = 1+1+14+1+36+1+14+1+1, manches 14 + 2 x 26 = 66, + 10 = 76 = 34 cm (biceps 30 + 4) ; corps 110 + 110 + 4 + 20 = 244 = 110,9 cm ; 76 + 110 = 186 rangs = 62 cm. XS : 62 / 212 / 66 -> 36 / 66 + 108 = 174 rangs = 58 cm. XXL : 82 / 304 / 96 -> 48 / 96 + 108 = 204 rangs = 68 cm.

### Point 3 : demi-devants de cardigan. Corrigé, réserve sur les côtes.

Cardigan manches montées col V, M (aisance 8) : dos 114 m, demi-devants "[1-15] Cast on 58 sts. Work 15 rows in 2x2 rib (the first st on the opening side is a selvedge st)." / "[16-126] Continue in stockinette for 111 rows" / "[127-127] Armhole: bind off 5 sts at the armhole edge at the beginning of the next RS row." (WS pour le devant droit) / "[128-157] Decrease 1 st at the armhole edge every 6 rows, 1 time, then every 8 rows, 3 times. 49 sts remain." / "[135-180] At the same time as the armhole decreases: V-neck: Bind off the selvedge st, then at the neck edge, decrease 1 st every 2 rows, 13 times, then every 4 rows, 5 times (18 sts per side)." / "[181-186] Shoulder: bind off the shoulder sts in 3 steps (10, 10, 10 sts)". Rangs continus (127 puis 128), épaules 181-186 = dos, 49 - 1 - 18 = 30 = 3 x 10.

Cardigan ras-du-cou S : 54 m (53 + lisière), "[123-123] Armhole: bind off 5 sts..." / "[124-151] Decrease... 45 sts remain." / "[152-158] Continue straight for 7 rows on 45 sts." / "[159-159] Neckline: bind off 11 sts at the neck edge (selvedge included)." / "[160-173] At the neck edge, decrease 1 st every 2 rows, 7 times." / "[174-174] Continue straight for 1 row." / "[175-180] Shoulder: ... (9, 9, 9 sts)". 45 - 11 - 7 = 27 = 3 x 9 ; encolure dos 34 = 2 x (10 + 7).

Réserve : la lisière est mentionnée, mais les 57 m. restantes (58 - 1) ne sont toujours pas un multiple de 4 : les côtes 2/2 ne tombent pas juste sur le demi-devant (57 = 14 x 4 + 1). Idem 53 m. en S. Le brief demandait la mention de la lisière, elle y est ; le raccord des côtes entre dos (114 = 28 x 4 + 2) et demi-devant reste approximatif. Mineur.

### Point 4 : grammaire. Corrigé.

EN : "every 3 rounds, 1 time" (raglan M, XS, XXL), "every 6 rows, 1 time" (gilet M), "every 7 rounds, 1 time" (raglan M manche). FR : "Continuer droit pendant 1 rang." (cardigan S, pull épaules tombantes M), "tous les 3 tours, 1 fois". Aucune occurrence de "1 rangs", "1 rows", "1 times", "1 tours" sur les 12 patrons (recherche regex sur toutes les instructions).

### Point 5 : intervalles pairs à plat. Corrigé.

Emmanchures : "every 6 rows, 1 time, then every 8 rows, 3 times" (M), "every 6 rows, 2 times, then every 8 rows, 2 times" (XS, S), "every 6 rows, 4 times, then every 8 rows, 1 time" (L), "every 4 rows, 7 times, then every 6 rows, 5 times" (XXL 36/50). Col V : "every 2 rows ... then every 4 rows ..." partout. Manches : "every 6 rows, 13 times, then every 8 rows, 3 times, then 3 rows straight" (M), "every 4 rows, 6 times, then every 6 rows, 13 times, then 2 rows straight" (L), "every 4 rows, 29 times, then every 6 rows, 9 times" (XXL 36/50), "tous les 6 rangs, 13 fois, puis tous les 8 rangs, 9 fois" (épaules tombantes). Têtes de manche : "every 2 rows, 14 times, then every row, 8 times" (M), "every 2 rows, 14 times, then every row, 10 times" (L), "every 2 rows, 8 times, then every row, 2 times" (10/15), "every 2 rows, 21 times, then every row, 26 times" (36/50), "tous les 2 rangs, 15 fois, puis à chaque rang, 4 fois" (S). Jamais de 3, 5, 7 ou 9 à plat. Les intervalles impairs subsistent seulement en rond (manche raglan "every 7 rounds"), ce qui est correct.

Les têtes de manche ferment juste : M 66 - 2 x 22 = 22 m. rabattues, 36 rangs = 123 à 158 ; XXL 36/50 130 - 2 x 47 = 36, 68 rangs = 200 à 267. Contrôle affiché "cap edge 22.9 cm vs armhole 22.4 cm" (M), "24.4 vs 24.3" (L), "27.5 vs 27.7" (XXL 36/50).

### Point 6 : calcul de la bordure d'encolure raglan. Corrigé.

M : "Neck edge stitches (cast-on) × 0.9 : 104 × 0.9 = 93.6 -> 94" (104 = 70 montées + 2 x 10 + 14 d'encolure devant). XS : "92 × 0.9 = 82.8 -> 82". XXL : "124 × 0.9 = 111.6 -> 112". Cardigan raglan M (FR) : "Mailles du bord d'encolure (montage) × 0,9 : 104 × 0.9 = 93.6 -> 94". Formule et résultat concordent. Sur les pièces à plat la formule reste "55.0 cm × 22/10 × 0.9 = 108.8 -> 108" (gilet M), "58.5 cm × 22/10 × 0.9 = 115.8 -> 116" (L), cohérente.

### Point 7 : totalRows des bordures. Corrigé pour l'encolure seulement.

Bordure d'encolure : "[1-1] Pick up 94 sts..." / "[2-13] Work 12 rows in rib 1/1." / "[14-14] Bind off loosely..." et totalRows = 14, DOM "Tricoter 14 rangs au total". Idem 8 en 10/15 ([2-7] + [8-8]) et 22 en 36/50 ([2-21] + [22-22]).

Non corrigé sur les autres bandes :
- Bandes d'emmanchure du gilet : "[1-1] Pick up 88 sts around the armhole (circumference: 45 cm)." / "[2-9] Work 8 rows in 1x1 rib, bind off loosely." et totalRows = 8 (9 rangs décrits). Idem XS (82 m, totalRows 8).
- Bandes de boutonnage : "[1-9] Button band (left front): pick up 102 sts..." et totalRows = 8 (cardigan M, S, raglan M).

### Point 8 : bande de boutonnage col V. Corrigé sur manches montées, cassé sur raglan.

Cardigan manches montées col V M : "Button band (left front): pick up 102 sts along the edge (3 sts for every 4 rows), work 8 rows in 1x1 rib, bind off loosely." 102 = (186 - 52) x 3/4 arrondi pair, soit la hauteur jusqu'au rang 134, le V démarrant au rang 135 : cohérent. Boutonnières "on row 4, at sts 3, 22, 41, 60, 79, 98". Ras-du-cou S : 136 m. pour 180 rangs (toute la hauteur, attendu).

Cardigan raglan col V M : voir R2, la soustraction du V s'applique à un patron qui n'a pas de V.

## 2. Régressions et nouveaux findings

### Majeur

**R1. Mode Tricot cassé sur toute pièce contenant une instruction "en même temps" (confirmé).** Le hook de parsing (`hooks/usePatternParsing.ts`) empile une entrée par rang pour chaque instruction dans l'ordre du tableau, sans tenir compte de rowStart. Cardigan col V M, devant gauche, 186 rangs : au rang 140 le mode affiche "Continue (row 13/30)" (diminutions d'emmanchure) sans le col V ; au rang 160 "Continue (row 3/46)" alors qu'on est au 26e rang du V ; au rang 186 "Continue (row 29/46)", "100% complete", flèche suivante désactivée. Les rangs 181-186 (épaules) et la fin du V ne sont jamais affichés : la pièce "se termine" en plein col V. C'est exactement le symptôme B1 de la première recette (compteur plafonné en plein V), qui n'est donc corrigé que dans le patron complet, pas en mode Tricot. Touche toutes les pièces col V à plat (gilet, pull montées, cardigan) dès que le V commence avant la fin du façonnage, et (assumé à la lecture du code, non rejoué) l'empiècement raglan dont "[2-12] At the same time, front neck..." suit "[2-76]" : le rang 77 de séparation est repoussé à l'index 88, au-delà de totalRows 77.

**R2. Cardigan raglan col V : le col V n'existe pas, la bande de boutonnage s'arrête 17 cm sous l'encolure (confirmé).** Simulation garment cardigan, sleeves raglan, neckline col-v, closure boutons, M, FR. Empiècement : "[2-12] En même temps, encolure devant : monter 2 m. au début de chacun des 10 rangs suivants (bords devant), puis monter 7 m. au début des 2 rangs suivants. Continuer en allers-retours : le devant reste ouvert." note "Profondeur d'encolure devant obtenue : environ 3.7 cm". C'est une encolure ras-du-cou montée, aucune diminution en V. La bordure d'encolure warne pourtant "Pour un col V, faire une double diminution centrée à la pointe du V". Et la bande de boutonnage "relever 102 m. le long du bord (3 m. pour 4 rangs)" = (186 - 50) x 3/4 : elle s'arrête au rang 136 alors que le bord devant court jusqu'au rang 12 de l'empiècement (encolure montée) : 50 rangs / 16,7 cm de bord devant sans bande, et la bordure d'encolure "d'un bord devant à l'autre" ne rejoint plus la bande. Le cardigan raglan ras-du-cou n'a pas ce problème (bande sur toute la hauteur). Le pull raglan col V a, par construction, la même absence de V (non rejoué, assumé à partir du code : le chemin raglan ne lit pas neckline).

**R3. Panneau "Refine my pattern" sur /patron : le changement de taille est toujours ignoré (confirmé, B3 de la première recette, hors périmètre du correctif mais non corrigé).** Raglan M généré, "Refine my pattern", clic XS, affichage "Based on size XS(customized) / Finished chest : 110 cm / Ease : 14 cm", "Regenerate pattern" : measurements inchangées (chest 96, bodyLength 62), pièces identiques (70 / 244 / 76 / 94). Le changement de taille ne marche que depuis /analyse.

### Mineur

- N1. totalRows des bandes d'emmanchure et de boutonnage inférieur d'un rang aux rangs décrits (détail au point 7).
- N2. Demi-devants de cardigan : 57 m. (M) ou 53 m. (S) hors lisière, pas un multiple de 4 pour les côtes 2/2 (détail au point 3).
- N3. Cardigan raglan (allers-retours) : l'empiècement parle de "tours" ("Tour d'augmentation", "Répéter tous les 2 tours", "À partir du 28e tour d'augmentation") alors que le travail est à plat ; le corps dit bien "Continuer en allers-retours ... pendant 101 rangs".
- N4. Demi-devants, encolure ras-du-cou : "[159-159] Neckline: bind off 11 sts at the neck edge" ne précise pas endroit / envers, contrairement à l'emmanchure ("at the beginning of the next RS row") ; pour le devant gauche le bord encolure est en début de rang envers.
- N5. Accents : "Tricoter 12 rangs en cotes 1/1" (bordure d'encolure FR, toutes configs) ; disclaimer FR "Confiance de l'analyse : high" (valeur non traduite). Les autres chaînes corrigées par la PR ("début du tour", "côtes 2/2", "vêtement terminé", "boutonnières") sont bien en prod.
- N6. Message de quota : la limite d'analyses est affichée sous le titre "Hmm, I couldn't read this one" avec les conseils photo ("Lay the garment flat...", "Try with another photo"), et le bloc est rendu deux fois sur la page. Le message dit "limit of 5 free analyses" : exact au regard du code (5 / 24 h par IP), mais l'UI présente un quota comme un échec de lecture.
- N7. Mélange FR/EN dans l'UI EN inchangé (B6) : "Monter / mailles / Tricoter / rangs au total / Schéma / Masquer / Rang / Rangs / Voir les calculs (5)", toast "Patron généré avec succès !", `<html lang>` reste "en" en FR. Schéma SVG toujours générique ("20.0 cm" en 3e cote sur toutes les pièces, B5). Estimation de laine toujours "DK - estimate 239-293 g" / "Yarn needed 83-106m" pour le raglan M et "84-108m" pour le cardigan M (B4). Constatés au passage, hors périmètre du correctif.

## 3. Ce qui tient toujours (invariants, confirmés)

- Raglan : sommes de montage (70 / 62 / 82), manches figées au biceps + dessous de bras (76 = 34 cm M, 66 = 30 cm XS, 96 = 43,6 cm XXL), dessous de bras identiques corps / manche (10 / 8 / 12), corps 244 / 212 / 304, longueur totale 186 / 174 / 204 rangs = 62 / 58 / 68 cm.
- Manches montées : dessous de bras rabattus identiques corps / manche (5/5 M et S, 6/6 L, 2/2 en 10/15, 13/13 en 36/50), biceps manche = biceps corps (76, 82, 34, 156), épaules devant = épaules dos sur toutes les configs (10/10/10, 9/9/9, 11/11/10, 5/5/4, 20/19/19, 13/13/13), encolure dos = devant (36 = 2 x 18 col V ; 34 = 2 x (10 + 7) ras-du-cou), longueur manche "40 cm" = 60 - 20,1.
- Épaules tombantes M : haut de manche 88 m. = 40 cm = 2 x 20 cm, manche 56 cm (= 39,9 + 20,1 - débord 4,4), épaules 39 = 13 x 3, devant 22 + 2 x 7 = 36 = encolure dos.
- Aucun nombre nul, négatif, NaN ou non entier dans les 12 patrons ; aucune plage de rangs décroissante ; tous les totalRows de corps = longueur de corps de la taille (186 / 174 / 192 / 180 / 93 / 340 rangs).
- FR / EN : mêmes nombres, instructions traduites (contrôlé sur XXL 36/50 et cardigan S).

## 4. Non vérifiable dans cette contre-recette

- Analyse réelle des deux photos fournies (quota d'analyses anonymes épuisé) : la reconnaissance "gilet col V" et "raglan" n'a pas été rejouée.
- PDF, impression, sauvegarde (compte interdit), nudge email : non rejoués, hors des 8 points.
- Mode Tricot sur l'empiècement raglan (R1) : assumé à la lecture de `hooks/usePatternParsing.ts`, confirmé seulement sur le demi-devant de cardigan.
