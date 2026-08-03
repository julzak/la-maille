# Guide de publication Pinterest (test manuel) - La Maille

Ce guide est exécutable seul, sans autre contexte que ce dossier `tasks/pinterest-test/`.
Objectif : publier les 25 pins de `pins.md` sur Pinterest en quelques semaines, sans automatisation,
pour mesurer ensuite dans GA4 si le canal draine du trafic qualifié (voir `mesure.md`).

## 1. Créer le compte Pinterest Business

- [ ] Aller sur https://business.pinterest.com et créer un compte Business au nom de **La Maille**
      (si un compte personnel existe déjà, le convertir en compte Business depuis les paramètres,
      c'est gratuit et ne fait rien perdre).
- [ ] Renseigner le profil : nom "La Maille", photo de profil (logo `public/logo-lamaille.svg` ou
      `public/logo-lamaille-120.png`), bio courte mentionnant le générateur de patron par photo,
      lien vers https://la-maille.com.
- [ ] Activer les Rich Pins (Pinterest > Réglages > Rich Pins) si disponible : elles affichent
      automatiquement titre et description depuis la page de destination.

## 2. Revendiquer le domaine la-maille.com

- [ ] Dans Pinterest Business, aller dans Réglages > Revendications (Claimed accounts) > Site web.
- [ ] Choisir la méthode balise meta HTML (la plus simple sans accès DNS) : Pinterest fournit une
      balise `<meta name="p:domain_verify" ...>` à ajouter dans le `<head>` du site.
      **Ceci nécessite une modification du code de l'app (hors périmètre de ce chantier)** :
      ajouter la balise fournie par Pinterest dans `app/layout.tsx`, déployer, puis cliquer sur
      "Vérifier" dans Pinterest. À faire dans une tâche séparée si Julien veut aller jusqu'au bout
      de la revendication.
- [ ] Alternative sans toucher au code : méthode fichier HTML à uploader à la racine du site, ou
      méthode DNS TXT si Julien préfère passer par OVH. Choisir une seule méthode.
- [ ] La revendication n'est pas bloquante pour publier les pins : elle apporte juste des stats de
      trafic web plus fines côté Pinterest. Peut être faite après le début du test.

## 3. Créer les tableaux (boards)

Créer un tableau distinct par langue et par thématique, pour que Pinterest catégorise bien le
contenu et que les épingleurs retrouvent facilement les sujets. Noms proposés :

### Tableaux FR
- [ ] **Tricot pour débutants** (accueil des pins tricot-debutant, comment-tricoter-un-pull)
- [ ] **Modèles de tricot gratuits** (modeles-tricot-gratuits, modele-pull-a-tricoter-gratuit, gilet-cardigan-tricot, layette-bebe-tricot)
- [ ] **Accessoires à tricoter** (echarpe-snood-tricot, bonnet-a-tricoter)
- [ ] **La Maille, patron par photo** (pins home / générateur / how-it-works FR)

### Tableaux EN
- [ ] **Knitting Patterns & Guides** (understanding-knitting-gauge, how-to-read-knitting-pattern-beginners, how-to-knit-sweater-that-fits, cable-knit-sweater-pattern)
- [ ] **Sweater Knitting From a Photo** (photo-to-knitting-pattern-complete-guide, how-to-recreate-sweater-from-photo, best-yarn-for-first-sweater)
- [ ] **La Maille, AI Pattern Generator** (pins home / generator / how-it-works EN)

Chaque tableau doit avoir une description courte (1-2 phrases, mots-clés naturels, mêmes règles
d'écriture que les pins : pas de tiret long, vrais accents en FR).

## 4. Cadence de publication

- [ ] Ne **jamais** publier les 25 pins d'un coup : Pinterest et l'algorithme favorisent une
      publication étalée.
- [ ] Rythme recommandé : **3 à 5 pins par semaine**, répartis sur les tableaux ci-dessus.
- [ ] Avec 25 pins à 3-5 par semaine, la publication complète prend **5 à 8 semaines**.
- [ ] Idéalement, épingler à des heures différentes (matin / soir) pour tester ce qui engage le
      mieux, sans que ce soit un critère bloquant pour un test.
- [ ] Utiliser la fonction "Programmer une épingle" native de Pinterest Business si disponible,
      pour étaler sans avoir à se connecter chaque jour.

## 5. Avant de publier chaque pin

- [ ] Vérifier que le lien de destination dans `pins.md` s'ouvre bien (les 25 ont été vérifiés en
      200 lors de la livraison de ce dossier, mais recontrôler si publication plusieurs semaines
      après la livraison, au cas où une page aurait été renommée entre-temps).
- [ ] Copier le titre et la description tels quels depuis `pins.md`, sans les réécrire (le ton et
      les mots-clés ont été travaillés pour éviter le bourrage).
- [ ] Choisir le tableau correspondant à la langue et à la thématique du pin (voir section 3).
- [ ] Ne pas oublier de coller le lien complet avec les paramètres UTM (`?utm_source=pinterest&...`),
      pas juste l'URL de la page.

## 6. Question ouverte à trancher par Julien avant de commencer

- Un compte Pinterest La Maille existe-t-il déjà ? Si oui, l'utiliser plutôt que d'en recréer un
  (perte de tout historique sinon). Si non, suivre la section 1.

## 7. Après 30 jours de publication

Passer à `mesure.md` pour lire les résultats dans GA4 et décider de la suite (automatisation ou
abandon du canal).
