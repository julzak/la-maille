# Recette calculateur v2 (PR #36, #37, #38) : 2026-08-23

Environnement : production la-maille.com, anonyme, sans compte. Deux agents frais (rapport-recette.md, contre-recette.md)
puis verification orchestrateur du mode Tricot en prod. Plan de test orchestrateur : plan-phase0.md.

## Verdict
GO avec reserves : le calculateur v2 est tricotable et coherent sur les 5 constructions, les 2 regressions trouvees
par la recette (col V plus long que le dos, mode Tricot cassé par les instructions simultanees) sont corrigees et
deployees. Les reserves portent sur des composants anterieurs a la v2 (metrage, schema, i18n UI, PDF, analyse photo).

## Ce qui fonctionne (observe en prod)
- Raglan top-down : sommes de montage, manches 66 + 10 = 76 m = biceps 34 cm, corps 244 m = cible, longueur totale
  187 rangs = 62,3 cm (M). Manche calculee sur l'empiecement reel (38 cm pour un empiecement de 25 cm).
- Manches montees (corps rond et pieces) : dessous de bras identiques corps/manche (7/7, 5/5, 10/10), epaules
  dos = devant (30/30, 34/34, 35/35), encolure dos 36 = devant 22 + 7 + 7, controle tete/emmanchure (20,8 vs 20,8).
- Epaules tombantes (simule) : haut de manche 88 m = 2 x 20 cm, manche 54 cm = 60 - debord.
- Sans manches et cardigan col V : devant = dos = 186 rangs, col V "en meme temps" des le rang 135, epaules 181-186.
- Cardigan demi-devants : lisiere sur montage impair (58 = 57 + 1), rangs continus, epaules = dos, bande 102 m
  arretee au depart du V.
- Mode Tricot : rang 135 = diminution d'emmanchure + depart du V, rang 181 = epaules, 186/186 atteint.
- 162 patrons du harnais (6 tailles x 3 echantillons x 9 configs) : 0 echec, 0 avertissement tete de manche,
  aucun nombre nul, negatif ou non entier, FR/EN identiques.

## Bugs corriges pendant la recette (PR #37, #38)
- B1 col V plus profond que l'emmanchure : devant 210 rangs vs dos 186 -> "en meme temps", hauteurs egales.
- B2 manche raglan sur emmanchure nominale -> sur profondeur reelle de l'empiecement.
- R1 mode Tricot : parser empilait les instructions sans lire rowStart -> indexation par rang, fusion des chevauchements.
- R2 cardigan raglan col V : bande trop courte -> encolure ras du cou avec avertissement, bande pleine hauteur.
- M1, M3, M4, M5, M6, M7, M8, N1, N3, accents des chaines FR reutilisees.

## Bugs restants, hors perimetre v2 (tasks/todo.md)
- Majeur : B3 "Affiner mon patron" ignore le changement de taille ; B4 estimation de laine incoherente
  (239-293 g vs 83-106 m) ; B7 photo epaules tombantes classee "montees" par l'analyse.
- Gênant : B5 schema SVG generique (20 cm en dur) ; B6 labels FR en dur dans l'UI EN, textes IA non traduits ;
  B8 PDF sans avertissements ni calculs, couverture "Debutant / 12-18h" non sourcee, pied de page vercel.app.
- Mineur : N2 cotes 2/2 sur 57 m hors lisiere, M9 accents hors patron, M11-M13, frictions UX (aisance sans champ,
  validation au blur, "trop large" bloquant sans seuil), message de quota rendu deux fois.

## Non jouable
- Sauvegarde / reouverture (compte interdit en automatisation, pas de compte de test).
- Manches montees sur photo reelle : la photo "setin" du blog est un raglan (M15) ; couvert par simulation et harnais.
- Captures d'ecran : volet navigateur masque, observations par DOM et store.

## Donnees de test creees
- 1 email dans /api/subscribe : julien+recette-calc@zakoian.com (newsletter decochee). A supprimer dans Brevo si souhaite.
- 5 analyses anonymes (quota IP atteint pour 24 h sur la machine de recette). Aucune ecriture en base hors
  table generations (log normal).
