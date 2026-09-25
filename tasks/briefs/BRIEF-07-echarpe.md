# BRIEF-07 : Écharpe

## Objectif
Une photo d'écharpe tricotée donne un patron d'écharpe aux dimensions choisies, dans le même parcours que le bonnet.

## Contexte
- Socle multi-vêtements posé par BRIEF-06 : `garmentCategory()`, union de mesures, routeur `generateFullPattern`, schéma et PDF par catégorie.
- La géométrie est triviale (un rectangle). Toute la valeur d'une écharpe est dans le point, que le calculateur ne gère pas aujourd'hui (le point détecté n'influence aucun calcul, même pour les pulls).

## Comportement attendu
1. Le prompt accepte les écharpes droites. Il continue de rejeter châles, snoods, cols, couvertures.
2. Bloc `scarf?: { stitch; border: "mousse" | "cotes" | "aucune" | "unknown"; fringe: boolean | null }`.
3. Mesures `ScarfMeasurements { kind: "scarf"; width; length }` avec 2 ou 3 presets de dimensions sourcés (source citée en commentaire, aucune valeur inventée).
4. Tricot à plat. Points supportés en v1 : jersey, mousse, côtes, point de riz. Jersey = bordure obligatoire (le jersey roule), le patron l'ajoute s'il n'y en a pas. Torsades, jacquard, dentelle : patron sur la base la plus proche + warning explicite « motif non reproduit ».
5. Franges en finition si détectées. Métrage de fil calculé sur la surface.

## Critères d'acceptation
- [ ] Harnais : presets × 3 jauges × points supportés. Contrôles génériques verts, plus : largeur tricotée à ±1 maille de la cible, montage compatible avec le motif du point, longueur à 1 rang près.
- [ ] Patrons haut et bonnet inchangés (diff vide).
- [ ] 3 vraies photos d'écharpes (dont 1 torsadée) : acceptées, patron FR et EN, warning présent sur la torsadée.
- [ ] Un châle et une couverture restent rejetés.
- [ ] PDF, mode Tricot, sauvegarde, page publique OK.
- [ ] `npm run build` propre.

## Hors périmètre
Reproduction des motifs (torsades, jacquard) : lot ultérieur si la demande le justifie. Snood, châle.

## Dépendances
BRIEF-06 mergé.

## Budget et conditions d'arrêt
- ~10 fichiers. Modèle d'exécution : sonnet (le socle est posé, périmètre cadré).
- Arrêt SUSPENSION : si le socle BRIEF-06 doit être modifié, s'arrêter et le signaler.
