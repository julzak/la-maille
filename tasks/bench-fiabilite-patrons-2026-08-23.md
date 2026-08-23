# Bench fiabilité des patrons, 2026-08-23

Question : les patrons générés sont-ils tricotables et justes ?
Méthode : exécution directe de `generateFullPattern` (lib/pattern-calculator.ts) sur les 6 tailles presets
et 5 combinaisons de construction, échantillon DK standard 20 m x 28 rgs / 10 cm, aisance +5 cm.
Aucun appel IA : tous les nombres du patron viennent du calculateur, l'IA ne choisit que
type de vêtement / manches / construction / encolure. Script : scripts/diag-bench-calculator.ts.
Référence tailles : Craft Yarn Council, women's size chart (craftyarncouncil.com/standards/woman-size).

## Verdict

Confirmé à l'exécution : les 3 voies principales (pull manches montées, pull raglan, cardigan)
produisent chacune au moins une instruction impossible à tricoter. Ce qui est linéaire (montage corps,
longueur corps, poignet, biceps, augmentations de manche) est juste. Tout ce qui est façonnage
(emmanchures, empiècement, épaules, encolure, assemblage) est faux ou incohérent.

Distribution réelle (saved_patterns, n=52) : pull/montées 18, cardigan 11, pull/raglan 3, sans-manches 10.
Les deux voies les plus utilisées sont touchées.

## Défauts confirmés

A. Encolure dos nulle ou négative. Pull montées (seamless et pièces) et cardigan, tailles XS à L :
   "Rabattre les 0 / -2 m. centrales pour l'encolure dos". XL : 2 m, XXL : 6 m.
   Cause : `shoulderWidth` (carrure totale, encolure comprise, cf. preset 43 cm = CYC cross back M 39.5-40.5)
   est traité comme la somme de deux épaules hors encolure. Épaule = (carrure - encolure) / 2, pas carrure / 2.

B. Raglan seamless intricotable. Empiècement de 13 rangs (4,6 cm) au lieu de ~20-22 cm, 8 diminutions
   par rang (standard : tous les 2 rangs), manches jamais jointes au corps avant l'empiècement, puis manches
   "relevées autour de l'emmanchure" alors qu'un raglan n'a pas d'emmanchure.

C. Raglan pièces incohérent. Dos et devant : "diminuer ... 35.5 fois". Manche : aucune diminution raglan,
   se termine droite à 68 m. Impossible à assembler.

D. Mailles en attente incohérentes (seamless). Corps : 16 m en attente par dessous de bras (8 % de la moitié).
   Manche : en reprend 9 (12 % du biceps). 7 m orphelines de chaque côté.

E. Constantes fixes quelle que soit la taille et l'échantillon :
   - Profondeur d'emmanchure 22 cm (seamless, raglan) / 20 cm (pièces). CYC : 15,5-16,5 (XS) à 20,5-21,5 (XL).
     Trop profond de 3 à 6 cm en XS/S.
   - Encolure 15 cm.
   - Bordure d'encolure : 80 m relevées pour toutes les tailles et tous les échantillons
     (à 14 m/10 cm = 57 cm de tour, à 28 m/10 cm = 29 cm).
   - Tête de manche 12 cm, côtes poignet 15 rangs.

F. Cardigan : épaules devant (35 m) vs dos (22 m) ne correspondent pas, pas de pente d'épaule devant,
   emmanchure devant 4 m rabattues vs 8 m au dos.

G. Nombres non entiers dans les instructions : "21.5 fois", "35.5 fois".

## Ce qui est juste
Montage corps (circonférence + aisance x échantillon), longueur totale, côtes bas, poignet, biceps,
rythme des augmentations de manche, estimation de fil (non vérifiée ici).

## Conséquence business
La non-rétention à 30-90 j (1 user sur 71) ne peut pas servir d'indicateur de fiabilité : elle est
surdéterminée par le fait que personne n'a fini un pull. Mais le bench dit que si quelqu'un essaie,
il bloque aux épaules ou à l'empiècement. La promesse ne peut pas être tenue par le calculateur actuel.

## Plan proposé (chantier calculateur v2, à valider)
1. Table de façonnage par taille (profondeur emmanchure, largeur encolure, hauteur tête de manche,
   dessous de bras) interpolée sur le tour de poitrine, source CYC.
2. Épaule = (carrure - encolure) / 2. Encolure dos toujours > 0, bordure relevée calculée depuis le tour d'encolure.
3. Raglan : une seule construction, top-down, manches jointes, diminutions/augmentations tous les 2 rangs,
   profondeur d'empiècement par taille. Supprimer la voie "raglan bottom-up sans jonction".
4. Dessous de bras : un seul nombre partagé corps/manche.
5. Cardigan : devants dérivés du dos (mêmes emmanchures, mêmes épaules).
6. Arrondis entiers partout, invariants vérifiés (somme des mailles à chaque étape).
7. scripts/test-calculator.ts : invariants sur 6 tailles x 3 échantillons x 5 constructions, avec sanity
   check sur le calculateur actuel (doit échouer).

## Resultat apres correction (meme journee)
Calculateur v2 livre sur la branche fix/calculateur-faconnage-v2 :
- lib/shaping.ts : table CYC interpolee, distribute() (repartition entiere des aug/dim), geometrie emmanchure / tete de manche / encolure.
- 5 familles : raglan top-down (rond, ou ouvert pour cardigan), montees en pieces, montees avec corps en rond, epaules tombantes, sans manches.
- scripts/test-calculator.ts : 162 patrons (6 tailles x 3 echantillons x 9 configs), 0 echec, 0 avertissement tete de manche.
  Sanity check sur l'ancien calculateur : 177 echecs (zero maille, negatifs, non entiers).
- Test reel dans l'app (photo raglan, taille M, fit oversized detecte) : patron coherent, corps 244 m = cible, manches 76 m = biceps.
