# BRIEF-05 — Test Pinterest manuel (25 pins, zéro code app)

## Objectif
Julien peut publier en quelques sessions ~25 pins pointant vers La Maille avec des liens tracés, et mesurer dans GA4 sous 30 jours si Pinterest draine du trafic qualifié.

## Contexte
- Pinterest est le canal naturel du public tricot (recherche visuelle, forte proportion de la cible). Décision cadrée : test MANUEL d'abord, automatisation uniquement si le test draine (VISION.md).
- Matière première existante : 42 images de blog (générées gemini-3.1, hébergées Cloudinary), les visuels du site, 43 articles comme destinations.
- Ce chantier ne touche PAS le code de l'app : le livrable est un dossier de contenu prêt à publier + un guide.
- GA4 est en place : les liens doivent porter des UTM (`utm_source=pinterest&utm_medium=social&utm_campaign=test-pins-2026-08`).

## Comportement attendu
Livrer un dossier `tasks/pinterest-test/` contenant :
1. `pins.md` : ~25 pins définis. Pour chacun : image à utiliser (URL Cloudinary existante), titre (max 100 caractères), description (max 500, mots-clés tricot naturels, pas de bourrage), lien de destination avec UTM. Mix : ~15 pins vers articles de blog (FR et EN), ~10 vers la home / le générateur.
2. `guide.md` : checklist de publication (création compte business La Maille, revendication du domaine la-maille.com, tableaux à créer avec leurs noms FR/EN, cadence recommandée 3-5 pins/semaine, pas tout d'un coup).
3. `mesure.md` : comment lire le résultat dans GA4 (sessions par utm_campaign) et le seuil de décision : >50 sessions Pinterest/mois au bout de 30 jours de publication → envisager l'automatisation ; sinon canal abandonné sans regret.

## Critères d'acceptation
- [ ] Les ~25 pins sont complets (image existante vérifiée accessible, titre, description, lien UTM valide vers une page qui existe).
- [ ] Répartition FR/EN cohérente avec les destinations (pins FR → articles FR, EN → EN).
- [ ] Le guide est exécutable par Julien sans autre contexte que le dossier.
- [ ] Aucune image inventée : uniquement des URLs vérifiées (Cloudinary ou site).

## Hors périmètre
- Aucune modification du code de l'app, aucune API Pinterest, aucune automatisation.
- Pas de génération de nouvelles images (utiliser l'existant ; si l'existant ne suffit pas pour 25 pins, en livrer moins et le dire).
- La publication elle-même : c'est une action de Julien (compte, validation du ton).

## Dépendances
Aucune. Les URLs Cloudinary sont dans `lib/blog-data.ts` (images des articles).

## Budget et conditions d'arrêt
- Périmètre attendu : 3 fichiers markdown dans `tasks/pinterest-test/`, lecture seule sur le reste du repo.
- Modèle d'exécution recommandé : haiku pour l'extraction des images/URLs, sonnet pour la rédaction des descriptions (ou sonnet seul). Respecter les règles d'écriture : jamais de tiret long, vrais accents français.
- Arrêt SUCCÈS : critères verts, dossier livré (pas de PR nécessaire si Julien préfère hors repo, sinon PR).
- Arrêt SUSPENSION : moins de 15 images exploitables trouvées (le signaler dans PLAN.md ## Blocages plutôt que d'inventer).

## Vérification
Contrôle automatisable : chaque URL d'image et de destination répond en 200 (script jetable curl). Relecture d'un échantillon de descriptions pour le ton.

## Questions ouvertes
- Compte Pinterest : existe-t-il déjà un compte La Maille ? (à confirmer par Julien avant publication, n'empêche pas de livrer le contenu)
