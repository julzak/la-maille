# BRIEF-08 : Chaussettes

## Objectif
Une photo de chaussettes tricotées donne un patron de chaussettes à la pointure choisie, dans le même parcours que le bonnet.

## Contexte
- Socle multi-vêtements posé par BRIEF-06.
- C'est le calcul le plus technique des trois : revers, jambe, talon, gousset, pied, pointe, avec des mailles qui doivent se raccorder d'une étape à l'autre. Fil fin, donc beaucoup de mailles : les erreurs d'arrondi se voient.

## Comportement attendu
1. Le prompt accepte les chaussettes. Il continue de rejeter chaussons, pantoufles, collants, jambières.
2. Bloc `socks?: { construction: "cuff-down" | "toe-up" | "unknown"; heel: "talon-rabat" | "rangs-raccourcis" | "afterthought" | "unknown"; cuff: "cotes-1x1" | "cotes-2x2" | "unknown"; legLength: "socquette" | "mi-mollet" | "haute" | "unknown" }`.
3. Mesures `SockMeasurements { kind: "socks"; footCircumference; footLength; legHeight; ease }`. Sélecteur par pointure : conversion pointure vers longueur de pied issue d'une source fiable citée en commentaire, jamais une formule approximative non sourcée. Mesures personnalisées possibles.
4. Construction v1 : du haut vers la pointe, en rond, talon à rabat et gousset, pointe en diminutions régulières, grafting (point de greffe) en finition. Aisance négative par défaut. Si l'analyse détecte `toe-up` ou un autre talon : patron v1 quand même + warning « construction différente de la photo ».
5. Patron pour une chaussette, avec la mention « tricoter 2 fois » et le métrage pour la paire.

## Critères d'acceptation
- [ ] Harnais : pointures du preset × 3 jauges × longueurs de jambe. Contrôles génériques verts, plus : mailles du rabat de talon = moitié du total, mailles relevées du gousset = nombre de rangs du rabat / 2, retour au nombre de mailles du pied après le gousset, longueur du pied avant la pointe = longueur du pied moins la longueur de la pointe (±1 tour), mailles restantes avant la greffe cohérentes et paires.
- [ ] Patrons haut, bonnet, écharpe inchangés (diff vide).
- [ ] 3 vraies photos de chaussettes (dont 1 jacquard) : acceptées, patron FR et EN.
- [ ] Un chausson et une paire de collants restent rejetés.
- [ ] Relecture d'un patron complet par un agent frais qui le « tricote » sur papier (méthode de la recette calculateur v2, `audits/2026-08-23-calculateur-v2/RECETTE.md`).
- [ ] PDF, mode Tricot, sauvegarde, page publique OK. `npm run build` propre.

## Hors périmètre
Toe-up, talon à rangs raccourcis, chaussettes jacquard reproduites, deux chaussettes en même temps.

## Dépendances
BRIEF-06 mergé. Peut passer avant BRIEF-07 si les données du lot 0 montrent plus de demande chaussettes.

## Budget et conditions d'arrêt
- ~10-12 fichiers. Modèle d'exécution : modèle de session (calcul non trivial).
- Arrêt SUSPENSION : si la source de conversion pointure / longueur de pied est introuvable ou contradictoire.
