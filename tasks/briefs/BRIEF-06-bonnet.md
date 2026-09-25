# BRIEF-06 : Bonnet, et socle multi-vêtements

## Objectif
Une photo de bonnet tricoté donne un patron de bonnet tricotable à la taille choisie, avec le même parcours que le pull (analyse, taille, patron, mode Tricot, PDF, sauvegarde). Ce lot pose aussi le socle qui accueillera l'écharpe (BRIEF-07) et les chaussettes (BRIEF-08).

## Contexte
- Analyse du 2026-09-25 (30 jours) : 27 % des scans rejetés, dont environ 60 % sont des demandes tricot ou crochet hors périmètre (bonnets, chaussettes, moufles, écharpes, échantillons). 87 % des visiteurs dont le premier scan est rejeté repartent sans patron.
- Décision Julien du 2026-09-25 (ne pas re-litiger) : élargir à bonnet, écharpe, chaussettes, dans cet ordre. Le modèle analyse, le code calcule : aucun chiffre du patron n'est produit par le LLM.
- Lot 0 (PR #55) : `generations.analysis` stocke le JSON complet. S'en servir pour vérifier en prod ce que le modèle renvoie sur de vraies photos de bonnets.
- Tout le pipeline actuel suppose un haut (voir la cartographie plus bas). Le calculateur est côté client, appelé depuis `components/SizeSelector.tsx` et `app/patron/page.tsx` (refine + changement de langue).
- Risque connu à lever : aujourd'hui `normalizeAnalysis()` (`lib/anthropic.ts`) ne valide pas `garment.type` contre l'union, et `chooseFamily()` transforme tout type inconnu ou `autre` en pull.

## Architecture imposée
1. **Catégorie** : `garment.type` gagne `"bonnet" | "echarpe" | "chaussettes"`. Un helper unique `garmentCategory(type)` renvoie `"top" | "hat" | "scarf" | "socks"`. Tous les aiguillages passent par lui, jamais par des comparaisons de chaînes dispersées.
2. **Analyse** : les champs haut (`neckline`, `neckband`, `sleeves`, `closure`) restent présents mais valent `unknown` / `sans` pour un accessoire (normalisation). Un bloc optionnel `hat?: { brim: { type: "cotes-1x1" | "cotes-2x2" | "mousse" | "roule" | "unknown"; folded: boolean | null }; shape: "ajuste" | "ample" | "unknown"; crown: "quartiers" | "spirale" | "fronce" | "unknown"; pompom: boolean | null }` porte le spécifique bonnet. Même principe à venir : `scarf?`, `socks?`.
3. **Validation** : `normalizeAnalysis()` rabat tout `garment.type` hors union sur `autre` et mappe les synonymes (hat, beanie, toque, bonnet, cap tricoté).
4. **Mesures** : `Measurements` reste le type haut. Nouveau `HatMeasurements { kind: "hat"; headCircumference; hatHeight; brimHeight; ease }`. `GeneratedPattern.measurements` devient une union discriminée ; les consommateurs haut (yarn, refine, PDF) sont gardés par `garmentCategory`.
5. **Générateur** : `lib/garments/hat.ts` exporte `generateHatPattern(analysis, gauge, measurements, yarn, lang): GeneratedPattern`. `generateFullPattern` devient un routeur : `top` part vers le code existant (inchangé), `hat` vers le module. Réutiliser `distribute()` / `distributeEven()` de `lib/shaping.ts` pour les diminutions.
6. **Tailles** : presets tour de tête, tirés du tableau de tailles bonnets du Craft Yarn Council (craftyarncouncil.com/standards/hat-sizing), source citée en commentaire. Aucune valeur inventée : si une donnée manque dans la source, la laisser hors preset et le signaler dans la PR.

## Comportement attendu
1. Le prompt accepte les bonnets (y compris revers, pompon, bonnet ample). Il continue de rejeter moufles, chaussons, crochet, amigurumi, échantillons et grilles, avec un `rejectionReason` qui dit ce que l'outil sait faire (pull, cardigan, gilet, bonnet).
2. `/analyse` affiche pour un bonnet une légende adaptée (bord, forme, sommet, pompon) et un sélecteur de tailles tour de tête, plus un formulaire de mesures personnalisées (tour de tête, hauteur, hauteur du bord, aisance).
3. Construction v1 : en rond, du bas vers le haut. Montage, bord en côtes (hauteur doublée si revers), corps droit, diminutions régulières du sommet jusqu'à une poignée de mailles, fermeture en serrant le fil. Aisance négative par défaut pour un bonnet ajusté, hauteur augmentée pour un bonnet ample. Nombre de mailles montées arrondi au multiple compatible avec les côtes ET le nombre de sections du sommet. Pompon mentionné en finition si détecté.
4. Le patron passe par tout l'aval : mode Tricot (instructions en tours), schéma coté (nouveau `PieceSchematic.kind: "hat"`), silhouette dans `GarmentSchematic`, métrage de fil adapté, PDF (nom du vêtement correct, pas « Pull »), sauvegarde, `PatternCard`, page publique (lignes manches/encolure masquées), OG image.
5. i18n FR et EN pour chaque nouvelle chaîne (`lib/i18n.ts` et `lib/i18n/public-pattern.ts`).

## Critères d'acceptation
- [ ] `scripts/test-calculator.ts` couvre le bonnet : toutes les tailles du preset × 3 jauges × configs (ajusté, ample, revers, côtes 1x1, côtes 2x2). Contrôles génériques 1 à 4 du harnais verts, plus : montage multiple du motif de côtes et du nombre de sections, circonférence tricotée à ±1 maille de la cible, hauteur totale égale à la mesure à 1 tour près, mailles restantes au sommet entre 6 et 12. Sanity check : casser volontairement le calcul fait échouer le harnais.
- [ ] Les 162 patrons haut existants restent verts, sans changement de sortie (diff des patrons générés avant/après = vide).
- [ ] Sur 3 vraies photos de bonnets (dont 1 à revers, 1 avec pompon), l'analyse est acceptée et le patron se génère en FR et en EN. Photos gardées dans `tasks/bonnet-images/`.
- [ ] Une photo de moufle et une d'amigurumi restent rejetées.
- [ ] Un bonnet ne peut plus produire un patron de pull par aucun chemin (y compris `autre`).
- [ ] PDF, mode Tricot, sauvegarde, page publique OK pour un bonnet.
- [ ] `npm run build` propre.

## Hors périmètre
- Écharpe et chaussettes (BRIEF-07, BRIEF-08), mais le socle doit les accueillir sans refonte.
- Constructions top-down, bonnets à côtes torsadées, jacquard : warning « motif non reproduit, patron sur la base jersey ».
- Pages SEO d'atterrissage accessoires (lot séparé après BRIEF-08).
- Toute modification du calcul des hauts.

## Dépendances
Lot 0 (PR #55) mergé et migration appliquée, pour lire les analyses réelles en prod.

## Budget et conditions d'arrêt
- Périmètre attendu : ~20-25 fichiers (types, prompt, nouveau module, harnais, 8-10 composants, i18n, PDF, pages publiques).
- Modèle d'exécution : modèle de session (architecture du socle).
- Arrêt SUCCÈS : critères verts + PR ouverte.
- Arrêt SUSPENSION : le socle impose de modifier la sortie des patrons haut, ou une donnée de taille introuvable dans une source fiable.

## Vérification
Harnais, puis parcours réel en dev avec les photos de `tasks/bonnet-images/` (quota anonyme : 5 analyses par IP et par 24 h, on peut simuler une analyse via sessionStorage `lamaille-storage`). Après déploiement, lire `generations.analysis` des premiers bonnets réels.
