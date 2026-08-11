# Latence analyse photo : leviers claude-opus-5 et comparaison sonnet-5

Généré par `scripts/diag-latence-opus.ts` sur les 4 images de `tasks/ab-kimi-images/` (mêmes prompts et construction de message que la prod, 1 image par appel). La variante low-hires utilise les mêmes images agrandies à 2576px pour simuler une photo smartphone non redimensionnée (la prod n'a aucun redimensionnement, limite 10 MB par photo).

| Variante | Params | Latence moy | Latence min-max | Tokens in/out moy | Coût moy/analyse | JSON valide |
|---|---|---|---|---|---|---|
| baseline | identique prod (thinking adaptatif, effort high) | 11.1 s | 9.2-15.7 s | 3581 / 662 | $0.0345 | 4/4 |
| effort-low | effort low | 8.3 s | 7.7-9.4 s | 3581 / 454 | $0.0292 | 4/4 |
| effort-medium | effort medium | 11.1 s | 9.1-14.2 s | 3581 / 573 | $0.0322 | 4/4 |
| compact-low | effort low + consigne sortie compacte | 9.5 s | 8.1-10.4 s | 3687 / 402 | $0.0285 | 4/4 |
| thinking-off | thinking disabled | 13.7 s | 12.0-17.8 s | 3581 / 653 | $0.0342 | 4/4 |
| low-hires | effort low, images 2576px (simule photo iPhone) | 11.3 s | 8.2-18.8 s | 7043 / 477 | $0.0471 | 4/4 |
| fast | speed fast ($10/$50) | échec | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast-effort-low | speed fast + effort low ($10/$50) | échec | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| sonnet-5 | claude-sonnet-5, défauts (adaptatif, effort high) | 9.5 s | 7.7-13.8 s | 3581 / 624 | $0.0201 | 4/4 |
| sonnet-5-low | claude-sonnet-5, effort low | 6.1 s | 5.4-6.5 s | 3581 / 524 | $0.0186 | 4/4 |

## Détail par appel

| Variante | Image | Latence | Tokens in/out | Coût | JSON | Confiance | Champs unknown |
|---|---|---|---|---|---|---|---|
| baseline | layette-cardigan | 15.7 s | 3581/867 | $0.0396 | ok | low | 2 |
| baseline | pull-ecru-plie | 10.4 s | 3581/636 | $0.0338 | ok | low | 10 |
| baseline | pull-irlandais-ecru | 9.3 s | 3581/565 | $0.0320 | ok | medium | 4 |
| baseline | pull-torsades-rouille | 9.2 s | 3581/580 | $0.0324 | ok | medium | 2 |
| effort-low | layette-cardigan | 9.4 s | 3581/474 | $0.0298 | ok | medium | 0 |
| effort-low | pull-ecru-plie | 7.7 s | 3581/462 | $0.0295 | ok | low | 9 |
| effort-low | pull-irlandais-ecru | 8.2 s | 3581/442 | $0.0290 | ok | medium | 3 |
| effort-low | pull-torsades-rouille | 8.0 s | 3581/436 | $0.0288 | ok | medium | 2 |
| effort-medium | layette-cardigan | 10.7 s | 3581/605 | $0.0330 | ok | medium | 1 |
| effort-medium | pull-ecru-plie | 10.6 s | 3581/594 | $0.0328 | ok | low | 10 |
| effort-medium | pull-irlandais-ecru | 14.2 s | 3581/547 | $0.0316 | ok | medium | 3 |
| effort-medium | pull-torsades-rouille | 9.1 s | 3581/547 | $0.0316 | ok | medium | 2 |
| compact-low | layette-cardigan | 10.1 s | 3687/391 | $0.0282 | ok | medium | 0 |
| compact-low | pull-ecru-plie | 8.1 s | 3687/418 | $0.0289 | ok | low | 10 |
| compact-low | pull-irlandais-ecru | 10.4 s | 3687/402 | $0.0285 | ok | medium | 3 |
| compact-low | pull-torsades-rouille | 9.2 s | 3687/397 | $0.0284 | ok | medium | 2 |
| thinking-off | layette-cardigan | 12.8 s | 3581/727 | $0.0361 | ok | low | 0 |
| thinking-off | pull-ecru-plie | 17.8 s | 3581/678 | $0.0349 | ok | low | 10 |
| thinking-off | pull-irlandais-ecru | 12.0 s | 3581/623 | $0.0335 | ok | medium | 4 |
| thinking-off | pull-torsades-rouille | 12.2 s | 3581/584 | $0.0325 | ok | medium | 2 |
| low-hires | layette-cardigan | 8.2 s | 7043/475 | $0.0471 | ok | medium | 0 |
| low-hires | pull-ecru-plie | 18.8 s | 7043/465 | $0.0468 | ok | low | 9 |
| low-hires | pull-irlandais-ecru | 9.7 s | 7043/474 | $0.0471 | ok | medium | 3 |
| low-hires | pull-torsades-rouille | 8.6 s | 7043/493 | $0.0475 | ok | medium | 2 |
| fast | layette-cardigan | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast | pull-ecru-plie | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast | pull-irlandais-ecru | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast | pull-torsades-rouille | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast-effort-low | layette-cardigan | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast-effort-low | pull-ecru-plie | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast-effort-low | pull-irlandais-ecru | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| fast-effort-low | pull-torsades-rouille | échec | - | - | - | - | 429 {"type":"error","error":{"type":"rate_limit_error","mess |
| sonnet-5 | layette-cardigan | 7.7 s | 3581/535 | $0.0188 | ok | medium | 1 |
| sonnet-5 | pull-ecru-plie | 8.8 s | 3581/710 | $0.0214 | ok | low | 10 |
| sonnet-5 | pull-irlandais-ecru | 13.8 s | 3581/700 | $0.0212 | ok | medium | 3 |
| sonnet-5 | pull-torsades-rouille | 7.9 s | 3581/550 | $0.0190 | ok | medium | 1 |
| sonnet-5-low | layette-cardigan | 6.2 s | 3581/502 | $0.0183 | ok | medium | 2 |
| sonnet-5-low | pull-ecru-plie | 6.3 s | 3581/579 | $0.0194 | ok | insufficient | 10 |
| sonnet-5-low | pull-irlandais-ecru | 5.4 s | 3581/483 | $0.0180 | ok | medium | 4 |
| sonnet-5-low | pull-torsades-rouille | 6.5 s | 3581/532 | $0.0187 | ok | medium | 1 |

## Sorties complètes (pour jugement qualité)

Baseline = sortie du test A/B (`tasks/ab-kimi-results/`), identique prod.

### layette-cardigan

#### baseline (prod)
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "cardigan",
    "confidence": 0.9
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Le vêtement est plié, ce qui masque les lignes de construction. On devine une ligne d'épaule/emmanchure sur le côté droit de l'image qui pourrait évoquer des manches montées ou une construction en pièces assemblées, mais l'ensemble en point mousse rend l'identification incertaine."
  },
  "neckline": {
    "type": "ouvert-cardigan",
    "confidence": 0.7
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "mousse",
    "confidence": 0.4
  },
  "sleeves": {
    "type": "unknown",
    "length": "longues",
    "confidence": 0.4
  },
  "stitch": {
    "mainPattern": "mousse",
    "confidence": 0.85,
    "notes": "Point mousse (rangs de bosses horizontales) sur l'ensemble du corps ; la bande de boutonnage semble également en mousse ou jersey."
  },
  "closure": {
    "type": "boutons",
    "buttonCountEstimate": 3,
    "confidence": 0.85
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.2
  },
  "limitations": [
    "Le vêtement est plié : impossible de voir l'encolure complète, les manches et la longueur totale",
    "Impossible de déterminer la méthode de construction (top-down, bottom-up, pièces assemblées)",
    "Impossible de vérifier si la bordure d'encolure est doublée",
    "Le nombre total de boutons peut être supérieur (partie inférieure masquée par le pli)"
  ],
  "warnings": [
    "Il s'agit probablement d'un vêtement de bébé (ensemble avec béguin et chaussons)",
    "L'analyse repose sur une vue partielle du vêtement plié"
  ],
  "overallConfidence": "low"
}
```

#### effort-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "cardigan",
    "confidence": 0.9
  },
  "construction": {
    "method": "top-down",
    "confidence": 0.4,
    "reasoning": "Vêtement plié, ligne d'épaule visible suggérant une construction en une pièce du haut vers le bas, mais assemblage possible"
  },
  "neckline": {
    "type": "ouvert-cardigan",
    "confidence": 0.7
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "mousse",
    "doubled": false,
    "confidence": 0.5
  },
  "sleeves": {
    "type": "montees",
    "length": "longues",
    "confidence": 0.4
  },
  "stitch": {
    "mainPattern": "mousse",
    "confidence": 0.85,
    "notes": "Point mousse dominant, bordures en côtes possibles"
  },
  "closure": {
    "type": "boutons",
    "buttonCountEstimate": 3,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié : longueur, forme des manches et type d'emmanchure non vérifiables",
    "Encolure partiellement masquée"
  ],
  "warnings": [
    "Il s'agit d'un ensemble bébé (béguin, chaussons, gilet) ; seul le gilet a été analysé"
  ],
  "overallConfidence": "medium"
}
```

#### compact-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "cardigan",
    "confidence": 0.9
  },
  "construction": {
    "method": "pieces-assemblees",
    "confidence": 0.5,
    "reasoning": "Vêtement plié, épaules semblant assemblées avec manches montées."
  },
  "neckline": {
    "type": "ouvert-cardigan",
    "confidence": 0.85
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "mousse",
    "doubled": false,
    "confidence": 0.5
  },
  "sleeves": {
    "type": "montees",
    "length": "longues",
    "confidence": 0.5
  },
  "stitch": {
    "mainPattern": "mousse",
    "confidence": 0.8,
    "notes": "Point mousse ou point de riz sur l'ensemble."
  },
  "closure": {
    "type": "boutons",
    "buttonCountEstimate": 3,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié, longueur des manches incertaine.",
    "Construction non vérifiable sans vue à plat."
  ],
  "warnings": [
    "Vêtement de bébé, mesures non estimables."
  ],
  "overallConfidence": "medium"
}
```

#### sonnet-5-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "cardigan",
    "confidence": 0.9
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.4,
    "reasoning": "Vêtement plié, structure interne difficile à évaluer précisément"
  },
  "neckline": {
    "type": "ouvert-cardigan",
    "confidence": 0.8
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "mousse",
    "doubled": false,
    "confidence": 0.5
  },
  "sleeves": {
    "type": "unknown",
    "length": "longues",
    "confidence": 0.4
  },
  "stitch": {
    "mainPattern": "mousse",
    "confidence": 0.75,
    "notes": "Point mousse principalement, avec un motif texturé (torsades légères) visible sur l'épaule"
  },
  "closure": {
    "type": "boutons",
    "buttonCountEstimate": 3,
    "confidence": 0.9
  },
  "fit": {
    "style": "regular",
    "confidence": 0.5
  },
  "limitations": [
    "Le vêtement est plié, la vue complète du corps et des manches n'est pas visible",
    "Impossible de déterminer avec certitude le type de manches (montées/raglan)",
    "La méthode de construction ne peut pas être confirmée sans voir l'intérieur ou le dos"
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```

### pull-ecru-plie

#### baseline (prod)
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "unknown",
    "confidence": 0.3,
    "notes": null
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.1,
    "reasoning": "Le vêtement est plié et enroulé, aucune couture d'épaule, emmanchure ou ligne de construction n'est visible."
  },
  "neckline": {
    "type": "unknown",
    "confidence": 0.1
  },
  "neckband": {
    "construction": "unknown",
    "height": "unknown",
    "stitch": "unknown",
    "doubled": null,
    "confidence": 0.1
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.1
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.85,
    "notes": "Tricot type aran en laine épaisse : panneaux de torsades entrelacées alternant avec des panneaux de point de riz/point de blé, séparés par des colonnes de mailles endroit. Couleur écrue naturelle."
  },
  "closure": {
    "type": "unknown",
    "buttonCountEstimate": 0,
    "confidence": 0.15
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.1
  },
  "limitations": [
    "Le vêtement est plié : impossible de déterminer sa forme générale (pull, cardigan ou gilet)",
    "Encolure non visible : type de col et bordure indéterminables",
    "Manches non visibles : type et longueur indéterminables",
    "Aucune fermeture ni bouton visible sur la partie exposée",
    "Méthode de construction non identifiable sans coutures ni empiècement visibles"
  ],
  "warnings": [
    "Analyse limitée au point de tricot uniquement",
    "Une photo du vêtement déplié et à plat (vue de face et de dos) est nécessaire pour une analyse complète"
  ],
  "overallConfidence": "low"
}
```

#### effort-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.5
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.2,
    "reasoning": "Le vêtement est plié, aucune ligne de construction (raglan, empiècement, coutures) n'est visible."
  },
  "neckline": {
    "type": "unknown",
    "confidence": 0.15
  },
  "neckband": {
    "construction": "unknown",
    "height": "unknown",
    "stitch": "unknown",
    "doubled": null,
    "confidence": 0.1
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.1
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.85,
    "notes": "Tricot aran : torsades, point de blé/riz et colonnes de côtes, laine épaisse écrue."
  },
  "closure": {
    "type": "unknown",
    "buttonCountEstimate": 0,
    "confidence": 0.3
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.15
  },
  "limitations": [
    "Vêtement plié : encolure, manches et fermeture non visibles",
    "Impossible de déterminer le type exact (pull ou cardigan)",
    "Aucune information sur la construction"
  ],
  "warnings": [
    "Analyse limitée à la texture du point"
  ],
  "overallConfidence": "low"
}
```

#### compact-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "unknown",
    "confidence": 0.3
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.2,
    "reasoning": "Vêtement plié et entouré d'un mètre ruban, aucune structure identifiable."
  },
  "neckline": {
    "type": "unknown",
    "confidence": 0.1
  },
  "neckband": {
    "construction": "unknown",
    "height": "unknown",
    "stitch": "unknown",
    "doubled": null,
    "confidence": 0.1
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.1
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.85,
    "notes": "Torsades et points texturés type aran en laine épaisse écrue."
  },
  "closure": {
    "type": "unknown",
    "buttonCountEstimate": 0,
    "confidence": 0.2
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.1
  },
  "limitations": [
    "Vêtement plié : type, encolure et manches invisibles.",
    "Aucun bouton ni ouverture visible."
  ],
  "warnings": [
    "Analyse limitée au point de tricot."
  ],
  "overallConfidence": "low"
}
```

#### sonnet-5-low
```json
{
  "analysable": false,
  "rejectionReason": "Le vêtement est plié et enroulé, ce qui empêche de voir sa forme générale, son encolure, ses manches et sa fermeture",
  "garment": {
    "type": "unknown",
    "confidence": 0.2
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.1,
    "reasoning": "Le vêtement étant plié, la méthode de construction n'est pas identifiable"
  },
  "neckline": {
    "type": "unknown",
    "confidence": 0.1
  },
  "neckband": {
    "construction": "unknown",
    "height": "unknown",
    "stitch": "unknown",
    "doubled": null,
    "confidence": 0.1
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.1
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.6,
    "notes": "On distingue des motifs torsadés et des points texturés sur le tricot plié"
  },
  "closure": {
    "type": "unknown",
    "buttonCountEstimate": null,
    "confidence": 0.1
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.1
  },
  "limitations": [
    "Le vêtement est plié, empêchant de voir la forme générale",
    "Aucune vue de l'encolure ou de la bordure",
    "Manches non visibles",
    "Système de fermeture non visible",
    "Type de vêtement impossible à déterminer avec certitude"
  ],
  "warnings": [
    "Image montrant un tricot plié sur une table avec des accessoires de mesure et de tricotage"
  ],
  "overallConfidence": "insufficient"
}
```

### pull-irlandais-ecru

#### baseline (prod)
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.85
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Le pull est plié, on ne voit ni les emmanchures ni les lignes d'augmentation. Les motifs de torsades verticaux suggèrent une construction bottom-up ou en pièces assemblées, mais rien ne permet de trancher."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.75
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": null,
    "confidence": 0.5
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.2
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Motif de type aran : torsades centrales entrelacées, tresses et losanges sur fond de point mousse/jersey envers. Bordure inférieure en côtes."
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.8
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.25
  },
  "limitations": [
    "Le vêtement est plié : type et longueur des manches non visibles",
    "Impossible de déterminer la méthode de construction (emmanchures et épaules masquées)",
    "Coupe/aisance non évaluable sur un vêtement plié",
    "Dos et éventuelle ouverture arrière non visibles",
    "Double épaisseur du col non vérifiable"
  ],
  "warnings": [
    "L'encolure n'est que partiellement visible : le type ras-du-cou est une déduction",
    "L'analyse du col (hauteur, point) est approximative en raison de l'angle de prise de vue"
  ],
  "overallConfidence": "low"
}
```

#### effort-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.85
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Le pull est plié, les lignes d'épaules et emmanchures ne sont pas visibles ; motifs de torsades verticaux sans indice clair de sens de tricot."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.8
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": false,
    "confidence": 0.6
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.2
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Torsades aran avec panneaux de points de riz/mousse et bordures en côtes"
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié : manches non visibles",
    "Impossible de déterminer la méthode de construction",
    "Longueur totale et fit incertains"
  ],
  "warnings": [
    "Analyse partielle en raison du pliage du vêtement"
  ],
  "overallConfidence": "medium"
}
```

#### compact-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.85
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Pull plié, les jonctions d'épaules et manches ne sont pas visibles."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.8
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": false,
    "confidence": 0.6
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.2
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Torsades type aran avec fond de mailles envers et bordure en côtes."
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié: manches et longueur non visibles.",
    "Construction indéterminable."
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```

#### sonnet-5-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.7
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Le pull est plié, la méthode de construction n'est pas clairement visible"
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.65
  },
  "neckband": {
    "construction": "picked-up",
    "height": "moyenne",
    "stitch": "cotes-1x1",
    "doubled": null,
    "confidence": 0.5
  },
  "sleeves": {
    "type": "unknown",
    "length": "unknown",
    "confidence": 0.2
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Motif de torsades élaboré sur le corps, bordures en côtes"
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.8
  },
  "fit": {
    "style": "unknown",
    "confidence": 0.3
  },
  "limitations": [
    "Le vêtement est plié, empêchant une vue complète des manches et de la coupe",
    "La méthode de construction ne peut pas être déterminée avec certitude",
    "L'ajustement (fit) n'est pas visible car le pull n'est pas porté"
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```

### pull-torsades-rouille

#### baseline (prod)
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.9
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Le pull est plié, les lignes d'épaules et d'emmanchures ne sont pas visibles. Les torsades verticales suggèrent un tricot en rangs ou en rond de bas en haut, mais aucune ligne de raglan ni de couture d'épaule n'est identifiable."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.85
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": false,
    "confidence": 0.65
  },
  "sleeves": {
    "type": "unknown",
    "length": "longues",
    "confidence": 0.55
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Torsades verticales alternées avec des colonnes de jersey et des bandes de point mousse ou de côtes; poignets et bas en côtes."
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié: impossible de voir les emmanchures, la forme des épaules et la longueur totale",
    "Type de montage des manches indéterminable",
    "Impossible de confirmer si la bordure d'encolure est doublée",
    "Coupe (ajustée/oversized) difficile à évaluer sans porté"
  ],
  "warnings": [
    "La construction (top-down/bottom-up) est une hypothèse non vérifiable sur cette photo"
  ],
  "overallConfidence": "medium"
}
```

#### effort-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.9
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Pull plié, lignes d'augmentation d'empiècement non visibles ; torsades verticales suggèrent un tricot en rond mais indéterminable."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.9
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": false,
    "confidence": 0.6
  },
  "sleeves": {
    "type": "unknown",
    "length": "longues",
    "confidence": 0.5
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Torsades sur fond jersey, bordures en côtes, style aran"
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.9
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié : forme générale, emmanchures et longueur non mesurables",
    "Type de tête de manche indéterminable"
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```

#### compact-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.9
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.3,
    "reasoning": "Pull plié, jonctions d'épaules non visibles."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.9
  },
  "neckband": {
    "construction": "picked-up",
    "height": "basse",
    "stitch": "cotes-1x1",
    "doubled": false,
    "confidence": 0.6
  },
  "sleeves": {
    "type": "unknown",
    "length": "longues",
    "confidence": 0.5
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.9,
    "notes": "Torsades sur fond jersey, poignets et bas en côtes."
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.85
  },
  "fit": {
    "style": "regular",
    "confidence": 0.4
  },
  "limitations": [
    "Vêtement plié: emmanchures et longueur non visibles.",
    "Type de montage des manches indéterminé."
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```

#### sonnet-5-low
```json
{
  "analysable": true,
  "rejectionReason": null,
  "garment": {
    "type": "pull",
    "confidence": 0.7
  },
  "construction": {
    "method": "unknown",
    "confidence": 0.4,
    "reasoning": "Le pull est plié, la méthode de construction n'est pas clairement identifiable, mais l'ouvrage en cours sur les aiguilles suggère un tricot en pièces séparées."
  },
  "neckline": {
    "type": "ras-du-cou",
    "confidence": 0.75
  },
  "neckband": {
    "construction": "picked-up",
    "height": "moyenne",
    "stitch": "cotes-1x1",
    "doubled": null,
    "confidence": 0.6
  },
  "sleeves": {
    "type": "montees",
    "length": "longues",
    "confidence": 0.6
  },
  "stitch": {
    "mainPattern": "torsades",
    "confidence": 0.85,
    "notes": "Motif torsadé complexe visible sur le corps, manches en côtes 1x1 au niveau des poignets"
  },
  "closure": {
    "type": "aucune",
    "buttonCountEstimate": 0,
    "confidence": 0.75
  },
  "fit": {
    "style": "regular",
    "confidence": 0.5
  },
  "limitations": [
    "Le vêtement est plié, ce qui limite la visibilité complète de la construction",
    "Impossible de déterminer si le col est doublé",
    "La méthode de construction (top-down, bottom-up, etc.) n'est pas clairement visible"
  ],
  "warnings": [],
  "overallConfidence": "medium"
}
```
