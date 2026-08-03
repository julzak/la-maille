# Mesure du test Pinterest dans GA4 - La Maille

GA4 est déjà installé sur le site (`app/layout.tsx`, measurement ID `G-3BHGQYMQVD`). Tous les liens
de `pins.md` portent les mêmes paramètres UTM :

```
utm_source=pinterest
utm_medium=social
utm_campaign=test-pins-2026-08
```

Ce fichier explique comment lire le résultat dans GA4 et donne le seuil de décision à 30 jours.

## 1. Où lire les sessions par utm_campaign dans GA4

- [ ] Se connecter à GA4 (propriété liée à `la-maille.com`).
- [ ] Menu de gauche > **Rapports** > **Acquisition** > **Acquisition de trafic**.
- [ ] Changer la dimension principale de "Session par défaut : groupe de canaux" à
      **"Session : campagne"** (ou "Session campaign" en anglais selon la langue de l'interface).
- [ ] Chercher la ligne **`test-pins-2026-08`** dans le tableau : c'est le nombre de sessions
      générées par les pins Pinterest de ce test.
- [ ] Ajouter un filtre secondaire sur **"Session : source"** = `pinterest` pour confirmer que les
      sessions proviennent bien de Pinterest et pas d'un autre canal ayant repris le même utm_campaign
      par erreur.
- [ ] Alternative plus rapide : dans **Explorations** > créer une exploration libre avec dimension
      "Session campaign" et métrique "Sessions", filtrée sur `campaign = test-pins-2026-08`. Permet
      de suivre l'évolution jour par jour sur la période de test.

## 2. Ce qu'il faut regarder en plus du volume brut

- [ ] **Taux d'engagement / durée moyenne de session** de ce trafic, pour vérifier qu'il ne s'agit
      pas de clics creux (utile pour juger de la qualité, sans bloquer la décision qui reste basée
      sur le volume, voir section 3).
- [ ] **Pages de destination** les plus visitées (rapport Acquisition avec dimension secondaire
      "Page de destination") : permet de voir si ce sont plutôt les articles de blog ou la home /
      le générateur qui convertissent le mieux en trafic, pour orienter un futur test si le canal
      est conservé.
- [ ] **Conversions** (génération de patron, création de compte) attribuées à ce trafic si un
      événement de conversion est configuré dans GA4 : bonus utile mais pas indispensable pour la
      décision de ce test (voir section 3, seuil basé sur les sessions).

## 3. Seuil de décision (à 30 jours de publication)

Le calendrier de référence est **30 jours à partir du début effectif de la publication des pins**
(pas de la création de ce dossier). Publier au moins la majorité des 25 pins avant de compter les
30 jours, sinon le test n'est pas représentatif.

- **Plus de 50 sessions Pinterest par mois** (mesurées via `utm_campaign=test-pins-2026-08`, source
  `pinterest`) au bout de ces 30 jours **→ envisager l'automatisation** du canal (génération et
  publication de pins en continu, potentiellement API Pinterest).
- **50 sessions ou moins** au bout de 30 jours **→ canal abandonné sans regret**. Pas de nouvelle
  session de publication manuelle, pas d'automatisation : le temps humain investi dans ce test
  (quelques sessions de publication étalées sur 5-8 semaines) est le seul coût, pas de code à
  détricoter.

Ce seuil est volontairement simple (un seul chiffre, une seule dimension) pour trancher vite sans
sur-interpréter un petit volume de données sur un canal en test.

## 4. À ne pas faire

- Ne pas décider avant 30 jours pleins : Pinterest est un canal à effet différé (les pins
  continuent d'être découverts des semaines après publication), un jugement à J+7 sera faussé à la
  baisse.
- Ne pas comparer ce chiffre à d'autres canaux payants ou déjà optimisés : la question est
  seulement "est-ce que ce canal, en test manuel léger, dépasse 50 sessions/mois", pas "est-ce que
  Pinterest est meilleur que Google".
