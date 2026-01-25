# OK Patron - Validation Checklist

## Tests Automatises

### Tests Unitaires (82 tests - TOUS PASSENT)

#### pattern-calculator.test.ts
- [x] `stitchesForCm` - calcul correct pour differentes gauges
- [x] `rowsForCm` - calcul correct pour differentes gauges
- [x] `roundToMultiple` - arrondi nearest/up/down, edge cases
- [x] `calculateDecreases` - diminutions symetriques, cas sans diminution
- [x] `calculateIncreases` - augmentations symetriques
- [x] `generateBackPanel` - differentes tailles et gauges
- [x] `generateSleeves` - manches longues, sans manches
- [x] `estimateYardage` - estimation par taille et poids fil
- [x] `generateFullPattern` - patron complet avec toutes pieces

#### messages.test.ts
- [x] `getRejectionMessage` - messages contextuels
- [x] `getStitchWarning` - avertissements pour points complexes
- [x] `getLoadingMessage` - rotation des messages

### Commandes
```bash
npm test              # Lancer tous les tests
npm run test:watch    # Mode watch
npm run test:coverage # Couverture de code
```

---

## Validation Manuelle Requise

### 1. Upload d'Image
- [ ] Upload par drag & drop fonctionne
- [ ] Upload par selection de fichier fonctionne
- [ ] Rejection des fichiers > 10MB
- [ ] Rejection des formats non supportes (PDF, etc.)
- [ ] Preview s'affiche correctement
- [ ] Bouton "Changer d'image" fonctionne

### 2. Analyse d'Image
Tester avec differents types d'images :

| Type d'image | Comportement attendu |
|--------------|---------------------|
| Pull basique jersey | Analyse complete, confiance elevee |
| Cardigan avec boutons | Detection boutons, 2 devants generes |
| Pull a torsades | Avertissement sur limitation torsades |
| Photo floue | Rejet avec message "trop-blurry" |
| Photo de chaussette | Rejet "not-garment" ou "not-supported" |
| Plusieurs vetements | Rejet "multiple-items" |
| Photo non-tricot | Rejet "not-knit" |

### 3. Formulaire de Mesures
- [ ] Validation des champs obligatoires
- [ ] Messages d'erreur clairs et contextualises
- [ ] Slider d'aisance fonctionne
- [ ] Coherence des mesures verifiee (poignet < biceps < poitrine)
- [ ] Calcul "poitrine finie" se met a jour en temps reel

### 4. Generation du Patron
- [ ] Patron genere contient toutes les pieces
- [ ] Calculs produisent des nombres realistes
- [ ] Instructions sont comprehensibles
- [ ] Avertissements affiches si applicable
- [ ] Disclaimer present

### 5. Export PDF / Print
- [ ] Bouton "Exporter PDF" ouvre dialogue impression
- [ ] Nom de fichier correct (ok-patron-[type]-[date].pdf)
- [ ] Page de couverture presente
- [ ] Mise en page propre
- [ ] Pas de boutons/UI dans le PDF
- [ ] Sections collapsibles ouvertes a l'impression

### 6. Responsive / Mobile
- [ ] Page d'accueil lisible sur mobile
- [ ] Upload fonctionne sur mobile (camera/galerie)
- [ ] Formulaire utilisable sur petit ecran
- [ ] Boutons suffisamment grands (min 44px)
- [ ] Touch targets adequats sur accordeons

### 7. Accessibilite
- [ ] Navigation clavier fonctionne
- [ ] Focus visible sur tous les elements interactifs
- [ ] Labels sur tous les inputs
- [ ] Messages d'erreur lies aux champs (aria-describedby)
- [ ] Contraste suffisant (WCAG AA)

### 8. Edge Cases a Tester

#### Gauges Extremes
```
Gauge tres fine : 35 mailles / 50 rangs pour 10cm
Gauge tres grosse : 8 mailles / 12 rangs pour 10cm
```

#### Mesures Extremes
```
Taille enfant : 60cm poitrine, 35cm longueur
Taille XL : 150cm poitrine, 80cm longueur
Aisance 0 : pas d'aisance
Aisance 20 : tres oversized
```

---

## Bugs Identifies et Corriges

### Corriges dans cette session
1. **Type mismatch `neckline.depth`** - Supprime des fixtures de test car non present dans le type
2. **Floating point precision** - Utilise `toBeCloseTo` au lieu de `toBe` pour les calculs
3. **Test yarn weight** - Corrige logique du test pour comparer meme gauge
4. **Import inutilise `STITCH_WARNINGS`** - Retire de patron/page.tsx
5. **Interface vide Skeleton** - Utilise type direct au lieu d'interface vide

### Bugs Potentiels a Surveiller
1. **Session storage plein** - Si trop d'images uploadees, le storage peut etre sature
2. **Timeout API Claude** - Si l'analyse prend > 60s, gerer le timeout cote client
3. **Caracteres speciaux dans nom fichier** - Sanitizer le nom de fichier PDF

---

## Performance

### Metriques Cibles
- [ ] Analyse < 15 secondes
- [ ] Time to First Byte < 500ms
- [ ] Largest Contentful Paint < 2.5s
- [ ] First Input Delay < 100ms

### Bundle Size
```
/ (Home)           : 5.47 kB
/analyse           : 48 kB
/patron            : 10 kB
Shared chunks      : 87.3 kB
```

---

## Avant Mise en Production

- [ ] Variables d'environnement configurees (ANTHROPIC_API_KEY)
- [ ] Rate limiting sur l'API
- [ ] Monitoring des erreurs (Sentry ou similaire)
- [ ] Analytics (eventuellement)
- [ ] Tests E2E avec Playwright/Cypress (optionnel)
- [ ] Backup/versioning des patrons generes (optionnel)
