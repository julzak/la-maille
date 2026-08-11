# Investigation du taux de rejet des analyses (45%)

Date : 2026-08-06. Contexte : 101 des 223 analyses loggées entre le 2026-06-28 et le
2026-08-02 (claude-opus-4-8) sont revenues `analysable=false`, soit 45%, taux stable
chaque semaine. Toutes les `rejection_reason` sont null.

## Faits établis (confirmés)

### 1. Les rejection_reason null s'expliquent par la chronologie, pas par un bug

Le logging de `rejection_reason` n'a été mergé que le 2026-08-04 15:29 (PR #21,
d4678ff). Les 101 rejets datent tous d'avant : la colonne n'était pas remplie,
ce n'est pas un backfill défaillant. Le logging actuel fonctionne, preuve
bout-en-bout : POST local d'une image de chemise tissée sur `/api/analyze`
(dev server branché sur la prod jazzy-apps) → ligne `generations` créée avec
`rejection_reason` rempli en français. Ligne de test à supprimer :
`id = 14b6f381-906d-4ba4-9b35-82d99a284186` (2026-08-06T08:39:16Z, ip_hash null).

### 2. Le prompt n'a pas changé pendant la période de fort rejet

`SYSTEM_PROMPT` est identique depuis le 2026-06-28 (c69fd90), section
"REJETTE UNIQUEMENT" comprise.

### 3. Le rejet ne vient ni du modèle ni de la strictesse du prompt sur de vraies photos de pulls

Bench `scripts/diag-rejet.ts` : 11 images synthétiques (gemini-3.1-flash-image)
simulant des photos utilisateurs réalistes, rejouées avec les paramètres exacts
de la prod de chaque ère (opus-5 : 8192 tokens + effort low ; opus-4-8 :
4096 tokens, sans output_config).

| image | cas | opus-5 | opus-4-8 |
|---|---|---|---|
| machine-fine | maille machine à peine visible | OK (pull, medium) | OK (pull, high) |
| porte-sombre | porté, intérieur sombre | OK (pull, medium) | OK (pull, medium) |
| pinterest-style | photo catalogue / screenshot | OK (pull, medium) | OK (pull, medium) |
| pull-loin | pull à 3 m, mailles indistinctes | OK (pull, low) | OK (pull, medium) |
| flou | flou de bougé net | OK (pull, low) | OK (pull, low) |
| crochet | cardigan crochet (pas du tricot) | OK (cardigan, medium) | OK (cardigan, medium) |
| bonnet | accessoire tricoté | OK (autre, medium) | non testé |
| echarpe | accessoire tricoté | REJET "pas un vêtement de type pull, cardigan ou gilet" | non testé |
| couverture | plaid grosse maille | REJET "pas un vêtement" | non testé |
| pelote | tricot en cours + aiguilles | REJET "pas un vêtement fini" | non testé |
| tisse | chemise tissée (contrôle) | REJET (légitime) | REJET (légitime) |

Les deux modèles acceptent tous les cas limites de vraies photos de pulls, même
flous ou lointains. Les règles de tolérance du prompt fonctionnent.

### 4. Ce qui est rejeté : le tricot hors vêtement pull/cardigan/gilet

Écharpe, couverture, ouvrage en cours (pelotes + aiguilles) sont rejetés alors
que ce sont des uploads très plausibles pour une app de tricot. La frontière est
incohérente : bonnet accepté (garment.type "autre"), écharpe rejetée. Hypothèse
principale pour les 45% : les visiteurs uploadent leur tricot en cours, leurs
accessoires, ou des images hors sujet, pas des photos de pulls ratées.
Statut : hypothèse plausible, à confirmer avec les rejection_reason réelles
qui se remplissent depuis le 2026-08-04.

### 5. Les photos rejetées sont irrécupérables

`/api/analyze` ne stocke jamais les images (base64 direct vers Anthropic, aucun
upload Storage). Impossible de rejouer les vrais rejets historiques. Si on veut
un corpus réel, il faudrait stocker les photos rejetées (décision produit + RGPD).

## Signaux secondaires (données generations)

- Rejet corrélé au nombre de photos : 48% avec 1 image (184 lignes) contre
  25-33% en multi-photos (45 lignes). Cohérent avec l'hypothèse "upload hors
  sujet" : qui envoie 4 photos de son pull est un vrai utilisateur motivé.
- 28 des 101 rejets arrivent moins de 10 min après un autre rejet : des retries.
  Le taux de rejet par visiteur est donc plus bas que 45% par requête.
- ip_hash n'existe que depuis le 2026-08-03 (9 lignes) : pas d'analyse par
  visiteur possible sur l'historique.
- Depuis opus-5 (2026-08-04) : 6 analyses, 0 rejet. Échantillon trop petit.

## Recommandations (à valider avant toute action)

1. Attendre 2-3 semaines de rejection_reason réelles avant de toucher au prompt :
   elles diront si l'hypothèse "hors sujet / accessoires / WIP" tient.
2. Décision produit sur les accessoires et ouvrages en cours : soit les accepter
   (garment.type "autre" existe déjà et est accepté par le générateur), soit
   assumer le rejet mais avec un message UX qui oriente ("prenez votre pull fini
   à plat"). Le cas écharpe vs bonnet montre qu'aujourd'hui c'est aléatoire.
3. Ajouter le suivi rejets (taux + top raisons) dans scripts/weekly-analytics.ts
   pour mesurer la baisse durable avec opus-5.
4. Optionnel : stocker les photos rejetées dans un bucket privé avec purge auto
   pour constituer un corpus de replay réel (implications RGPD à cadrer).

## Rejouer le bench

```bash
./node_modules/.bin/tsx scripts/diag-rejet.ts tasks/rejet-images
./node_modules/.bin/tsx scripts/diag-rejet.ts tasks/rejet-images --model=claude-opus-4-8
```

Résultats en cache dans tasks/rejet-results/ (pas de re-facturation), `--force`
pour rejouer. Images générées avec gemini-3.1-flash-image (prompts dans
l'historique de session du 2026-08-06).
