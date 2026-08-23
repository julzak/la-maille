# Recette calculateur v2, prod la-maille.com, 2026-08-23

Testeur : agent externe, navigateur intégré, session anonyme (aucun compte, aucune connexion). Le volet navigateur s'est retrouvé masqué après la première génération (captures d'écran blanches, voir "Limites"), toute la recette a été faite en lisant le DOM, le localStorage / sessionStorage et les blobs générés. Les nombres ci-dessous sont ceux renvoyés par le calculateur en prod (confirmés, pas déduits du code).

Analyses consommées : 4 sur 6 autorisées (raglan, "set-in" du blog, épaules tombantes, gilet sans manches). Toutes en 17 à 21 s, POST /api/analyze 200. Aucune erreur console, aucune requête en échec.

Données créées : un email dans /api/subscribe (gate PDF) : julien+recette-calc@zakoian.com, case newsletter décochée. Rien d'autre (le bouton Save renvoie vers la modale de connexion, non franchie).

## 1. Scénarios joués

| # | Scénario | Résultat |
|---|---|---|
| 1 | Raglan, M 96, 22/30 | Passé sur les mailles, échoué sur la longueur de manche (B2) et le schéma (B5) |
| 1b | Raglan XS 82 et XXL 124 | Idem : mailles cohérentes, manche trop longue de 3,6 cm (XS) et 8 cm (XXL) |
| 1c | Raglan, échantillon fin 36 m / 50 rg, 82 cm, aisance 0 | Passé (mailles), warning "empiècement approfondi" absent alors que l'empiècement passe de 92 à 104 rangs |
| 1d | Raglan, échantillon gros 10 m / 15 rg, 130 cm, aisance 20 | Passé (mailles), empiècement 32 cm, manche 7 cm trop longue |
| 2 | Manches montées, S 88, 28 m / 38 rg, aisance 5 (photo épaules tombantes analysée "montées") | Passé : épaules dos = devant (34 m), dessous de bras 5 = 5, tête 20,8 cm vs emmanchure 20,8 cm |
| 2b | Manches montées XXL 124 | Passé (épaules 35 = 35, dessous de bras 10 = 10, tête 29,2 = 29,2) |
| 3 | Épaules tombantes | Non jouable en photo réelle : la photo drop-shoulder est analysée "montées" 70 % (B7). Joué en forçant sleeves.type = "marteau" dans le store : passé (haut de manche droit 88 m = 40 cm = 2 x 20 cm, manche 54 cm = 60 - 6,25 de débord) |
| 4 | Gilet sans manches col V, M puis XS | ÉCHOUÉ : devant 24 rangs plus long que le dos (B1) |
| 4b | Cardigan boutonné col V manches montées (simulé en forçant garment = cardigan, closure = boutons) | ÉCHOUÉ : même défaut de devant (B1), trou au rang 128, montage 57 m en côtes 2/2 |
| 5 | Mesures extrêmes carrure 60 / poitrine 82 / corps 40 | Carrure : bloqué par la validation "Semble trop large par rapport a la poitrine" (pas de crash). Corps 40 cm accepté, patron cohérent (121 rangs = 40,3 cm) |
| 5b | Changement de taille depuis le panneau "Refine my pattern" sur /patron | ÉCHOUÉ (B3) |
| 6 | PDF (FR, raglan bulky) | Passé sur le contenu des pièces ; warnings absents, pied de page vercel.app, métadonnées de couverture non sourcées (B8, M-list) |
| 6b | Impression | Passé : document print dédié, toutes pièces + warnings. L'état après fermeture du dialogue d'impression n'a pas pu être vérifié (window.print stubé) |
| 7 | Bascule EN/FR sur un patron généré | Passé : mêmes nombres, textes traduits. Mélange de langues dans l'UI EN (B6) |
| 8 | Sauvegarde + réouverture | Non jouable (compte interdit). Save ouvre la modale "Sign in" |
| 9 | Anonyme, 4 analyses + 12 générations | Passé : aucun rate limit rencontré, gate email mémorisée (localStorage lamaille-email-gate) |
| 10 | Mode Knit sur le devant du gilet/cardigan | ÉCHOUÉ : compteur plafonné à 186/186 "100% complete" en plein col V (B1) |

## 2. Bugs

### Bloquant

**B1. Col V : le devant est plus long que le dos, les pièces ne s'assemblent pas.**
Repro : gilet sans manches (photo blog gilet), taille M. Dos : "Rangs 181-186 : Encolure dos et épaules : rabattre les 36 m. centrales...", total 186 rangs. Devant : "[129-158] Diminuer 1 m. de chaque côté tous les 7 rangs, 2 fois, puis tous les 8 rangs, 2 fois. Il reste 96 m." puis "[159-204] Col V : Diviser le travail au centre... diminuer 1 m. tous les 2 rangs, 8 fois, puis tous les 3 rangs, 10 fois (18 m. par côté)." puis "[205-210] Épaules : rabattre les mailles d'épaule en 3 fois (10, 10, 10 m.)". Le devant fait 210 rangs (70 cm) pour un dos de 186 (62 cm), alors que `totalRows` affiché reste 186. Le warning "L'encolure devant est plus profonde que l'emmanchure : elle commence avant la fin du façonnage d'emmanchure" est émis mais le séquencement n'applique pas le "en même temps" : le col V devrait démarrer au rang 135. Même chose en XS (devant 196 rangs vs dos 174) et sur le cardigan simulé (Left front / Right front 210 vs Back 186). Conséquence en mode Knit : "Left front • Row 186/186", "Continue (row 29/46)", "100% complete", bouton suivant désactivé : les 17 derniers rangs du V et les épaules sont inatteignables.

### Majeur

**B2. Raglan : la manche est calculée avec la profondeur d'emmanchure nominale, pas avec la profondeur réelle de l'empiècement.** M : "Yoke depth: 25 cm (76 rows)" et warning "Yoke deepened to fit 37 increase rounds (large ease): yoke depth 76 rows instead of 68", mais manche "Rangs 2-105 ... 44 sts" + "Cuff 15 rows" = 120 rangs = 40 cm = 60 - 20,1. Avec un empiècement de 25,3 cm la manche devrait faire environ 35 cm : 5 cm de trop. XS : empiècement 22 cm pour 18,4 nominal, manche 39,7 cm (3,6 cm de trop). XXL : empiècement 32 cm pour 23,7, manche 39,3 cm (8 cm de trop). Custom 10/15 : empiècement 32 cm pour 24,4, manche 41,3 cm (7 cm de trop). Le corps, lui, est bien raccourci pour tenir la longueur totale (62 cm respectés).

**B3. Panneau "Refine my pattern" sur /patron : le changement de taille est ignoré.** Repro : générer M, cliquer "Refine my pattern", cliquer XS (ou S, XXL). Affichage : "Based on size XS(customized) / Finished chest : 110 cm / Ease : 14 cm". Cliquer "Regenerate pattern" : toast "Patron généré avec succès !", mais measurements inchangées (chest 96) et patron identique (244 m). Le changement de taille ne fonctionne que depuis /analyse.

**B4. Estimation de laine incohérente et irréaliste.** Raglan M DK : "DK - estimate 239-293 g" et "Yarn needed 83-106m" (un pull adulte DK demande environ 1 000 à 1 300 m ; 240 g de DK représentent environ 600 m). Custom 36 m/50 rg sur 82 cm : "491-601 g" / "159-203m" (plus de laine en grammes pour un pull plus petit). Raglan 10 m/15 rg sur 150 cm de tour : "83-101 g" / "28-36m", et PDF "92m environ". Gilet M : "239-293 g" / "37-48m", identique en grammes au pull avec manches. `estimatedYardage` vaut 266 pour le raglan M, le set-in M, le gilet M et le cardigan M : la valeur ne dépend pas de la famille de construction.

**B5. Schéma (SVG "Schéma") générique et faux.** Toutes les pièces (empiècement, corps, manche, bordure d'encolure) sont dessinées avec la même silhouette "devant avec emmanchures et encolure". Cotes : largeur = mailles / échantillon, hauteur = rangs / échantillon, troisième cote toujours "20.0 cm" quelle que soit la taille ou l'échantillon (raglan XS, M, custom 10/15, gilet, cardigan), quatrième cote = 30 % de la largeur (9.5 / 31.8, 33.3 / 110.9, 10.4 / 34.5, 12.8 / 42.7). La bordure d'encolure (2 cm de haut) est dessinée avec une emmanchure de 20 cm qui sort du viewBox (path y 40 à 120 dans un SVG de hauteur 88). C'est exactement la "constante identique d'une taille à l'autre" exclue par le brief.

**B6. Mélange FR/EN dans l'interface EN.** Avec l'UI en anglais, les cartes de pièces affichent "70 m.", "Monter", "mailles", "Tricoter", "rangs au total", "Schéma", "Masquer", "Rang 1", "Rangs 2-76", "Voir les calculs (5)", "Résultat :". Toast de génération "Patron généré avec succès !" et "Analyse terminée / Remplissez le formulaire..." en français. Les textes d'analyse IA (reasoning, limitations, "Analyse partielle") sont en français dans l'UI EN, jusque dans le disclaimer du patron EN ("Identified limitations: Vue arrière ou avant difficile à distinguer"). `<html lang>` reste "en" après passage en FR.

**B7. La photo épaules tombantes est analysée en manches montées.** drop-shoulder-construction.webp (pull beige à plat, manches clairement droites sur un corps rectangulaire) : `sleeves.type = "montees"` (70 %), `construction = "pieces-assemblees"` (60 %), reasoning "suggérant des manches montées droites sur un corps rectangulaire". Résultat : patron à emmanchures façonnées (rabattre 7 m., 6 diminutions) et tête de manche de 14 cm, à l'opposé de la promesse "épaules tombantes = manche à haut droit". Le chemin drop ("marteau") existe et produit un patron correct, mais la photo de référence ne l'atteint pas. Note : le libellé UI pour ce type est "Marteau", qui désigne une autre construction en français que les épaules tombantes.

**B8. Le PDF ne reflète pas tout l'écran.** Les avertissements de pièce ("Empiècement approfondi pour loger 23 tours d'augmentation...", "Tricoter 2 manches identiques", "Pour un col V, faire une double diminution centrée...") et les calculs n'apparaissent pas dans le PDF (7 pages A4, react-pdf). La couverture affiche "Débutant", "12-18h" et "Taille XXL" pour un patron en mesures personnalisées 130 cm : ces trois valeurs ne figurent nulle part à l'écran et leur origine est inconnue (possiblement constantes). Pied de page "la-maille.vercel.app" sur toutes les pages au lieu de la-maille.com.

### Mineur

- M1. Calcul affiché de la bordure d'encolure en raglan incohérent avec le nombre retenu : "Neck circumference: 40.8 cm × 22/10 × 0.9 = 80.84 -> 94" (M), "73.8 -> 82" (XS), "93.8 -> 112" (XXL), "116.3 -> 126", "44.0 -> 58". Le nombre relevé semble dériver des mailles réelles de l'encolure, pas de la formule affichée. Sur le chemin set-in la formule et le résultat concordent ("97.5 -> 98").
- M2. Warning "Yoke deepened" émis de façon inconsistante : émis pour M (76 vs 68), XS (66 vs 64), absent pour le custom 36/50 (104 rangs vs 92 nominal) et pour le custom corps 40 cm (64 vs 56).
- M3. Trou de rang sur les devants de cardigan : "[127-127] Armhole: bind off 5 sts... next RS row" puis "[129-158] Decrease...". Le rang 128 n'est jamais décrit.
- M4. Cardigan : "Cast on 57 sts. Work 15 rows in 2x2 rib" : 57 n'est pas un multiple de 4 (ni pair), les côtes ne tombent pas.
- M5. Cardigan : bande de boutonnage "pick up 140 sts along the edge (3 sts for every 4 rows)" = toute la hauteur du devant (186 rangs), alors que le bord droit s'arrête au départ du V (rang 158) et que la bordure d'encolure (108 m) couvre déjà le V "from one front edge to the other" : chevauchement non arbitré.
- M6. Grammaire des répétitions : "then every 3 rounds, 1 times", "Continuer droit pendant 1 rangs", "Continue straight for 1 rows" (raglan M, XS, XXL, set-in S, XXL, gilet).
- M7. Intervalles impairs en tricot à plat : "Diminuer 1 m. de chaque côté tous les 5 rangs, 6 fois" (dos set-in M), "tous les 9 rangs, 4 fois" (S), "tous les 7 rangs, 2 fois, puis tous les 8 rangs" (gilet) : la diminution tombe alternativement sur endroit et envers.
- M8. Bordure d'encolure : instructions "[2-7] Work 6 rows" + "[8-8] Bind off" mais `totalRows` = 6 ; dans le PDF "Total rangs 3 rg" pour une bordure décrite sur 5 rangs.
- M9. Accents manquants dans les chaînes FR : "circonferences", "apres", "cotes 2/2", "cotes 1/1", "Aiguille a laine", "piece", "vetement termine", "details", "Patron genere", "Mailles relevees", "Semble trop large par rapport a la poitrine", "Joindre en rond en veillant a ne pas vriller", "debut", "Echantillon", "Genere", "Verifiez", "Materiel necessaire" (document print).
- M10. PDF : assemblage numéroté deux fois ("1- . 1. Empiècement, corps et manches..."), "dk" en minuscules, tiret long avant "Dominique de La Maille".
- M11. Modale "Projet en cours" en FR avec date au format EN ("Aug 23, 02:53 PM") et "Patron genere". La modale apparaît au-dessus de la zone d'upload après qu'une photo a déjà été déposée.
- M12. Le formulaire "Personnaliser les mensurations" s'ouvre avec des valeurs (corps 60, carrure 42, bras 58, poignet 16) qui ne correspondent à aucun preset (M = 62 / 43 / 60 / 17), et il oublie les valeurs saisies dès qu'on revient de /patron vers /analyse.
- M13. Badge "✓ Sauvegardé" affiché en haut du patron pour un utilisateur anonyme (sauvegarde locale seulement).
- M14. "garment.type = gilet" force la famille sans manches : un gilet boutonné à manches longues (sens courant en français) deviendrait un débardeur. Assumé à la lecture de `chooseFamily`, non reproduit faute de photo.
- M15. La photo "setin-sleeve-sweater-example.webp" de l'article raglan-vs-set-in est un raglan (lignes raglan visibles, analysée raglan 92 %). Contenu blog, hors périmètre calculateur, mais elle rend le scénario "manches montées" injouable avec les photos fournies.

## 3. Ce qui est passé (chiffres clés)

- Raglan : sommes de montage justes (70 = 1+1+14+1+36+1+14+1+1), manches 14 + 2 x 26 = 66, +10 dessous de bras = 76 = 34 cm = biceps 30 + 4 ; corps 110 + 110 + 4 + 20 = 244 = 110 cm ; total 77 + 110 = 187 rangs = 62,3 cm pour M. Même rigueur en XS, XXL, 36/50 et 10/15. Côtes et poignets multiples de 4, bordures 1x1 paires.
- Set-in (round) : dessous de bras rabattus identiques corps/manche (7/7, 5/5, 10/10), épaules dos = devant (30/30, 34/34, 35/35), encolure dos 36 = devant 22 + 7 + 7, contrôle tête/emmanchure affiché (23,8 vs 23,5 ; 20,8 vs 20,8 ; 29,2 vs 29,2), hauteur de tête 12 à 17 cm, longueur manche 40 cm = bras 60 - 20,1.
- Drop (simulé) : haut de manche 88 m = 40 cm = 2 x profondeur d'emmanchure, longueur manche 54 cm = 60 - débord 6,25, épaules 43 = 43, assemblage adapté.
- Dimensions variables avec la taille et l'échantillon : côtes 15 rangs à 30 rg/10 cm, 25 à 50, 8 à 15 ; bordure 6 / 10 / 3 rangs ; encolure dos 32 / 36 / 44 m ; profondeur d'encolure devant 10 à 14 rangs selon la taille.
- Aucun nombre nul, négatif ou non entier rencontré dans les 12 patrons générés.
- FR/EN : mêmes nombres, instructions traduites, assemblage traduit.

## 4. Frictions UX

- Après génération, le retour au choix de taille passe par le navigateur (ou le stepper), et "Refine my pattern" ne sert à rien pour la taille (B3).
- L'aisance est un slider Radix sans champ numérique : impossible de saisir 14 directement.
- Les validations de mesures ne se déclenchent qu'au blur : en tapant une valeur puis en cliquant directement "Créer mon patron", le message apparaît après le clic et rien ne se passe (pas de scroll vers l'erreur).
- Le message "Semble trop large par rapport a la poitrine" bloque la génération au lieu d'avertir, sans indiquer le seuil (43 cm refusé pour 82 cm de poitrine, 40 accepté).
- Textes IA (reasoning, limitations) jamais traduits.

## 5. Limites de la recette

- Captures d'écran impossibles après la première génération (volet navigateur masqué, captures blanches) : pas d'image dans ce dossier, toutes les observations viennent du DOM.
- Épaules tombantes et cardigan testés en modifiant `sessionStorage.lamaille-storage` (analysis.sleeves.type = "marteau", garment.type = "cardigan") : calculateur réel, analyse simulée.
- Le PDF a été inspecté via le blob généré en page (texte extrait des content streams) ; le fichier sauvegardé via base64 s'est révélé corrompu par le transfert et a été supprimé pour ne pas induire en erreur.
- Impression : `window.print` stubé pour ne pas ouvrir le dialogue système ; le retour à la vue normale après impression n'a pas été vérifié.
