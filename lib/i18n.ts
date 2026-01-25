import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "fr" | "en";

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "lamaille-lang",
    }
  )
);

// Translations
export const translations = {
  fr: {
    // Header
    siteName: "LA MAILLE",
    tagline: "De la photo au patron",

    // Home page
    homeTitle: "De la photo au patron",
    homeSubtitle:
      "Uploadez une photo de n'importe quel vetement tricote. La Maille le lit et cree un patron sur-mesure pour vous.",
    homeUploadTitle: "Glissez votre photo ici",
    homeUploadSubtitle: "ou cliquez pour selectionner",
    homeUploadFormats: "JPG, PNG ou WebP - Max 10MB",
    homeUploadButton: "Choisir une photo",
    homeHowItWorks: "Comment ca marche",
    homeLimitations: "Mes limites",

    // Analysis page
    analyzeTitle: "Lecture et creation",
    analyzeSubtitle:
      "Verifiez ce que je vois et entrez vos parametres pour creer le patron",
    sourceImage: "Votre photo",
    changeImage: "Changer",
    analyzing: "Je lis votre tricot...",
    analysisError: "Erreur de lecture",
    retry: "Reessayer",
    otherImage: "Autre photo",
    imageNotAnalyzable: "Je n'arrive pas a lire cette image",
    tryAnotherImage: "Essayer une autre photo",
    analysis: "Ce que je vois",
    limitations: "Mes limites",
    yourParameters: "Vos parametres",
    analysisInProgress: "Lecture en cours",
    formWillAppear:
      "Le formulaire apparaitra des que j'aurai fini de lire votre photo.",
    analysisImpossible: "Lecture impossible",
    tryWithAnotherPhoto:
      "Essayez avec une autre photo, bien eclairee et montrant clairement le vetement de face.",
    waiting: "En attente",
    analysisWillStart: "La lecture va demarrer automatiquement.",

    // Form
    gauge: "Echantillon",
    whyEssential: "Pourquoi c'est essentiel ?",
    gaugeExplanation:
      "L'echantillon determine toutes les dimensions. Sans lui, le patron sera faux.",
    gaugeDescription: "Tricote avec votre fil et vos aiguilles, lave et bloque",
    stitchesPer10cm: "Mailles pour 10cm",
    rowsPer10cm: "Rangs pour 10cm",
    needleSize: "Aiguilles (mm)",
    measurements: "Mesures",
    measurementsDescription: "Mesurez-vous ou un vetement qui vous va bien",
    chestCircumference: "Tour de poitrine",
    bodyLength: "Longueur corps",
    shoulderWidth: "Largeur epaules",
    armLength: "Longueur bras",
    wristCircumference: "Tour de poignet",
    bicepCircumference: "Tour de biceps",
    ease: "Aisance",
    easeDescription: "Largeur supplementaire ajoutee au patron",
    fitted: "Ajuste",
    regular: "Regular",
    oversized: "Oversized",
    finishedChest: "Poitrine finie",
    yarn: "Fil",
    yarnWeight: "Grosseur du fil",
    composition: "Composition (optionnel)",
    compositionPlaceholder: "Ex: 100% merino",
    generatePattern: "Creer mon patron",
    generating: "Creation en cours...",
    howToMeasure: "Comment prendre mes mesures ?",
    measurementGuide: "Guide des mesures",
    measurementGuideDesc: "Prenez vos mesures sur le corps, en sous-vetements, sans serrer.",
    chestMeasureDesc: "Mesurez a l'endroit le plus large, sous les aisselles, en gardant le metre horizontal.",
    bodyLengthMeasureDesc: "Du point le plus haut de l'epaule jusqu'a la longueur souhaitee (hanches, mi-cuisses...).",
    shoulderWidthMeasureDesc: "D'un bout d'epaule a l'autre, en passant par la nuque.",
    armLengthMeasureDesc: "De l'epaule au poignet, bras legerement plie.",
    wristMeasureDesc: "Au-dessus de l'os du poignet.",
    bicepMeasureDesc: "A l'endroit le plus large du bras, decontracte.",
    easeAriaLabel: "Aisance en centimetres",
    fittedRange: "Ajuste (0-5)",
    regularRange: "Regular (5-10)",
    oversizedRange: "Oversized (10-20)",

    // Pattern page
    yourPattern: "Votre patron",
    generatedOn: "Genere le",
    disclaimer:
      "Ce patron est une ESTIMATION automatique. Il n'a pas ete teste.",
    verifyAndSwatch:
      "Verifiez vos calculs et tricotez un echantillon avant de commencer.",
    close: "Fermer",
    projectSummary: "Resume du projet",
    type: "Type",
    construction: "Construction",
    calculatedSize: "Taille calculee",
    chestLabel: "cm poitrine",
    materialsNeeded: "Materiel necessaire",
    yarnLabel: "Fil",
    estimate: "estimation",
    needles: "Aiguilles",
    circularMin: "circulaires 80 cm min",
    accessories: "Accessoires",
    accessoriesList: "Aiguille a laine, marqueurs, ciseaux",
    buttons: "Boutons",
    buttonsDescription: "boutons d'env. 1.5-2 cm",
    zipper: "Fermeture",
    zipperSeparable: "Zip separable",
    patternInstructions: "Instructions du patron",
    touchToExpand: "Touchez chaque section pour voir les details",
    assembly: "Assemblage",
    finishing: "Finitions",
    couldNotDetermine: "Ce qui n'a pas pu etre determine avec certitude",
    requiresJudgment:
      "Ces elements necessitent votre jugement ou la consultation d'un patron dedie.",
    sharePDF: "Partager le PDF",
    downloadPDF: "Telecharger le PDF",
    download: "Telecharger",
    restart: "Recommencer",
    reportProblem: "Signaler un probleme",
    generatingPDF: "Generation...",
    loading: "Chargement...",

    // WeavingLoader messages
    loaderReceivingImage: "Reception de votre image...",
    loaderReadingKnit: "Je lis votre tricot...",
    loaderWeavingPattern: "Je tisse votre patron...",
    loaderSaving: "Sauvegarde...",
    couldntReadThis: "Hmm, je n'arrive pas a lire celui-ci",
    tipsForGoodPhoto: "Conseils pour une bonne photo :",
    tipLayFlat: "A plat ou sur cintre",
    tipGoodLighting: "Bien eclaire, sans ombres",
    tipSingleItem: "Vetement seul, entier",
    tryWithAnotherPhotoBtn: "Essayer avec une autre photo",

    // Garment types
    "garment.pull": "Pull",
    "garment.cardigan": "Cardigan",
    "garment.gilet": "Gilet",
    "garment.autre": "Autre",
    "garment.unknown": "Inconnu",

    // Construction methods
    "construction.en-rond": "En rond",
    "construction.pieces-assemblees": "Pieces assemblees",
    "construction.top-down": "Top-down",
    "construction.bottom-up": "Bottom-up",
    "construction.raglan": "Raglan",
    "construction.side-to-side": "Cote a cote",
    "construction.unknown": "Non identifie",

    // Necklines
    "neckline.ras-du-cou": "Ras du cou",
    "neckline.col-v": "Col V",
    "neckline.col-rond": "Col rond",
    "neckline.col-bateau": "Col bateau",
    "neckline.col-roule": "Col roule",
    "neckline.capuche": "Capuche",
    "neckline.bateau": "Col bateau",
    "neckline.ouvert-cardigan": "Ouvert (cardigan)",
    "neckline.unknown": "Non identifie",

    // Sleeve types
    "sleeve.montees": "Montees",
    "sleeve.raglan": "Raglan",
    "sleeve.marteau": "Marteau",
    "sleeve.sans-manches": "Sans manches",
    "sleeve.unknown": "Non identifie",

    // Sleeve lengths
    "sleeve-length.longues": "Longues",
    "sleeve-length.3-4": "3/4",
    "sleeve-length.courtes": "Courtes",
    "sleeve-length.sans": "Sans",
    "sleeve-length.unknown": "Non identifie",

    // Stitch patterns
    "stitch.jersey": "Jersey",
    "stitch.cotes": "Cotes",
    "stitch.mousse": "Point mousse",
    "stitch.torsades": "Torsades",
    "stitch.jacquard": "Jacquard",
    "stitch.dentelle": "Dentelle",
    "stitch.autre": "Autre",
    "stitch.unknown": "Non identifie",

    // Fit styles
    "fit.ajuste": "Ajuste",
    "fit.regular": "Regular",
    "fit.oversized": "Oversized",
    "fit.unknown": "Non identifie",

    // Confidence levels
    "confidence.high": "Confiance elevee",
    "confidence.medium": "Confiance moyenne",
    "confidence.low": "Confiance faible",
    "confidence.insufficient": "Insuffisant",

    // Yarn weights
    "yarn.lace": "Lace (dentelle)",
    "yarn.fingering": "Fingering",
    "yarn.sport": "Sport",
    "yarn.dk": "DK",
    "yarn.worsted": "Worsted",
    "yarn.aran": "Aran",
    "yarn.bulky": "Bulky (grosse)",

    // Messages
    analysisComplete: "Analyse terminee",
    fillFormToGenerate: "Remplissez le formulaire pour generer votre patron.",
    patternGenerated: "Patron genere avec succes !",
    pdfDownloaded: "PDF telecharge !",
    pdfShared: "PDF partage !",
    preparingShare: "Preparation du partage...",
    generatingPDFMessage: "Generation du PDF...",
    mayTakeFewSeconds: "Cela peut prendre quelques secondes.",
    pdfGenerationError: "Erreur lors de la generation du PDF",
    pleaseRetry: "Veuillez reessayer.",
    shareError: "Erreur lors du partage",
    pdfDownloadedInstead: "Le PDF a ete telecharge a la place.",
    complexStitchDetected: "Point complexe detecte",
    limitationsFromAnalysis: "",

    // Footer
    footerMadeWith: "Fait avec amour a Paris",
    footerDisclaimer: "Les patrons sont des estimations - verifiez toujours vos calculs",

    // Analysis labels
    neckline: "Encolure",
    sleeves: "Manches",
    stitch: "Point",
    fit: "Coupe",
    confidenceLabel: "Confiance",

    // Garment overlay validation
    doesThisMatchYourGarment: "Est-ce que ca correspond a votre vetement ?",
    yesConfirm: "Oui, continuer",
    noTryAgain: "Non, reessayer",
    whatDoesNotMatch: "Qu'est-ce qui ne correspond pas ?",
    necklineIssue: "L'encolure",
    sleevesIssue: "Les manches",
    shapeIssue: "La forme generale",
    isCardigan: "C'est un cardigan, pas un pull",
    isNotCardigan: "C'est un pull, pas un cardigan",
    back: "Retour",
    validateAnalysis: "Validez l'analyse",
    yourPhoto: "Votre photo",
    whatIUnderstood: "Ce que j'ai compris",
    confidenceHigh: "Confiance elevee",
    confidenceMedium: "Confiance moyenne",
    confidenceLow: "Confiance faible",
    uncertain: "Incertain",

    // Knitting mode
    knittingMode: "Mode tricot",
    launchKnitting: "Lancer le tricot",
    exitKnitting: "Quitter",
    panel: "Panneau",
    row: "Rang",
    previousRow: "Rang precedent",
    nextRow: "Rang suivant",
    markerHere: "Marqueur ici",
    addMarker: "Ajouter un marqueur",
    markerNote: "Note (optionnel)",
    markerAdded: "Marqueur ajoute",
    nightMode: "Mode nuit",
    pieceBack: "Dos",
    pieceFront: "Devant",
    pieceLeftSleeve: "Manche G",
    pieceRightSleeve: "Manche D",
    pieceFrontLeft: "Devant G",
    pieceFrontRight: "Devant D",
    pieceBody: "Corps",
    pieceYoke: "Empiecement",
    pieceNeckline: "Encolure",
    pieceSleeves: "Manches",
    decreaseInRows: "Diminution dans {0} rangs",
    increaseInRows: "Augmentation dans {0} rangs",
    decreaseNow: "Diminution maintenant !",
    increaseNow: "Augmentation maintenant !",
    sectionComplete: "Section terminee !",
    goToNext: "Passer a",
    resumeKnitting: "Reprendre ou vous en etiez ?",
    resumeAt: "Reprendre au rang",
    startOver: "Recommencer",
    progressLabel: "Progression",
    rowOf: "sur",
    completedLabel: "Termine",
    markersLabel: "Marqueurs",
    noMarkers: "Aucun marqueur",
    deleteMarker: "Supprimer",
    currentInstruction: "Instruction en cours",
    contextLabel: "Contexte",
    swipeHint: "Swipez pour changer de rang",
    patternNotFound: "Patron non trouve",
    goBackToPattern: "Retourner au patron",

    // Knit mode
    knitModeTitle: "Mode tricot",
    documentModeTitle: "Patron complet",
    knitModeWelcomeBack: "Bon retour !",
    knitModeContinueFrom: "Continuer au rang {row} ?",
    knitModeContinue: "Continuer",
    knitModeComplete: "termine",

    // Gauge checker
    gaugeCheckerTitle: "Verifiez votre echantillon",
    gaugeCheckerDesc: "Comparez votre echantillon tricote avec le carre de reference",
    gaugeCheckerInstructions: "Posez votre echantillon sur l'ecran. Les bords doivent correspondre au carre.",
    swatchSmaller: "Mon echantillon est plus petit",
    swatchLarger: "Mon echantillon est plus grand",
    swatchCorrect: "Ca correspond !",
    gaugeCorrectTitle: "Parfait !",
    gaugeCorrectDesc: "Votre echantillon correspond. Vous pouvez continuer avec ces valeurs.",
    gaugeTighterTitle: "Gauge plus serre",
    gaugeTighterDesc: "Votre gauge est plus serre que prevu. Essayez des aiguilles plus grosses (+0.5mm) ou ajustez vos valeurs.",
    gaugeLooserTitle: "Gauge plus lache",
    gaugeLooserDesc: "Votre gauge est plus lache que prevu. Essayez des aiguilles plus fines (-0.5mm) ou ajustez vos valeurs.",
    checkAgain: "Verifier a nouveau",
    calibrateScreen: "Calibrer l'ecran pour plus de precision",
    recalibrateScreen: "Recalibrer l'ecran",
    calibrated: "Calibre",
    calibrationInstructions: "Posez une carte bancaire sur le rectangle et ajustez jusqu'a ce que les bords correspondent.",
    calibrationAdjust: "Ajustez avec le curseur ci-dessous",
    creditCard: "Carte bancaire",
    smaller: "Plus petit",
    larger: "Plus grand",
    saveCalibration: "Sauvegarder",
    cancel: "Annuler",
    swatchNote: "L'echantillon doit etre lave et bloque avant mesure, exactement comme sera le vetement fini.",
    checkSwatchVisually: "Verifier mon echantillon visuellement",

    // Yarn calculator
    yarnCalculator: "Calculateur de laine",
    yarnCalculatorDesc: "Combien de laine avez-vous ?",
    dontKnowYetYarn: "Je ne sais pas encore",
    standardEstimate: "Estimation standard basee sur vos mesures",
    haveMyYarn: "J'ai deja ma laine",
    numberOfSkeins: "Nombre de pelotes",
    metersPerSkein: "Metrage par pelote (m)",
    total: "au total",
    estimatedYarnNeeded: "Besoin estime",
    yarnNeeded: "Laine necessaire",
    yourYarnStock: "Votre stock",
    yarnSufficient: "Vous avez assez de laine !",
    yarnSufficientFull: "Vous avez assez de laine ! (Besoin estime : {0}m)",
    yarnTight: "C'est un peu juste",
    yarnTightFull: "C'est un peu juste. Prevoyez peut-etre une pelote de plus pour etre tranquille.",
    yarnInsufficient: "Il vous manque environ {0}m",
    yarnInsufficientFull: "Il va vous manquer environ {0}m.",
    suggestionsToAdjust: "Suggestions pour ajuster :",
    adjustBodyLength: "Raccourcir le corps de {0}cm (-{1}m)",
    adjustSleeveLength: "Raccourcir les manches de {0}cm (-{1}m)",
    adjustEase: "Reduire l'aisance de {0}cm (-{1}m)",
    applyAdjustments: "Appliquer les ajustements selectionnes",
    adjustmentsApplied: "Ajustements appliques !",
    patternAdjustedForYarn: "Patron ajuste pour votre stock de laine",
    yarnEstimateDisclaimer: "Le metrage est une estimation. Chaque tricoteur·se a une tension differente. En cas de doute, prenez toujours une pelote de plus !",

    // Size presets
    chooseABase: "Choisir une base",
    startFromStandardSize: "Partir d'une taille standard",
    customMeasurements: "Mesures personnalisees",
    basedOnSize: "Base taille",
    modified: "(modifie)",
    standardValue: "Valeur standard",
    youEntered: "Vous avez saisi",
    noNeedForPrecision: "Pas besoin de precision au millimetre ! Des valeurs approximatives suffisent.",
    hipCircumference: "Tour de hanches",

    // Image uploader
    dropImageHere: "Deposez l'image ici",
    dragPhotoHere: "Glissez une photo ici",
    or: "ou",
    browseFiles: "Parcourir les fichiers",
    maxSize: "JPG, PNG ou WebP - Max 10 Mo",
    changeImageBtn: "Changer d'image",
    analyzeThisImage: "Analyser cette image",
    analyzingBtn: "Analyse...",
    dropZoneLabel: "Zone de depot d'image. Cliquez ou deposez une image.",
    photoTipsTitle: "Conseils pour une bonne photo :",
    photoTipFront: "De face, bien eclaire",
    photoTipHanger: "Sur cintre ou a plat",
    photoTipAlone: "Vetement seul",
    retryWithAnotherPhoto: "Reessayer avec une autre photo",
    imageUploadSuccess: "Image chargee avec succes",
    imageUploadError: "Erreur lors du chargement de l'image",

    // Auto-save
    saving: "Sauvegarde...",
    saved: "Sauvegarde",
    projectInProgress: "Projet en cours",
    resumeProjectQuestion: "Vous avez un projet en cours. Voulez-vous le reprendre ?",
    resumeProject: "Reprendre",
    newProject: "Nouveau projet",

    // Home page steps
    step: "Etape",
    step1Title: "Uploadez votre inspiration",
    step1Desc: "Une photo de face du vetement, bien eclairee",
    step2Title: "La Maille lit le tricot",
    step2Desc: "Identification de la forme, des proportions et des points",
    step3Title: "Entrez vos mesures",
    step3Desc: "Tour de poitrine, longueur, et votre gauge",
    step4Title: "Recevez votre patron adapte",
    step4Desc: "Instructions rang par rang, adaptees a vous",

    // Capabilities
    whatICanDo: "Ce que je sais faire",
    myLimits: "Mes limites (pour l'instant)",
    basicSweaters: "Pulls et cardigans basiques",
    basicStitches: "Jersey, cotes, point mousse",
    adaptedCalcs: "Calculs adaptes a VOTRE echantillon",
    cablesLimit: "Torsades : je les repere mais ne reproduis pas la grille",
    colorworkLimit: "Jacquard : forme oui, dessin non",
    laceLimit: "Dentelle complexe",
    experimentalLimit: "Constructions experimentales",

    // Pattern instructions
    "pattern.stitchesFor": "Mailles pour {0} cm",
    "pattern.rowsFor": "Rangs pour {0} cm",
    "pattern.roundedFrom": "Arrondi de {0} a {1}",
    "pattern.knitStraightNoDecrease": "Tricoter droit sans diminutions",
    "pattern.knitStraightNoIncrease": "Tricoter droit sans augmentations",
    "pattern.decreaseEverySide": "Diminuer 1 maille de chaque cote tous les {0} rangs, {1} fois",
    "pattern.decreaseRemaining": "({0} rangs restants a tricoter droit)",
    "pattern.decreaseEveryRs": "Diminuer 1 maille de chaque cote a chaque rang endroit, {0} fois",
    "pattern.increaseEverySide": "Augmenter 1 maille de chaque cote tous les {0} rangs, {1} fois",
    "pattern.increaseStart": "(commencer apres {0} rangs)",
    "pattern.increaseEveryRs": "Augmenter 1 maille de chaque cote a chaque rang endroit, {0} fois",

    // Seamless body
    "pattern.bodyInRound": "Corps (en rond)",
    "pattern.castOnCircular": "Monter {0} mailles sur aiguilles circulaires. Joindre en rond en veillant a ne pas vriller. Placer un marqueur pour le debut du rang. Tricoter {1} rangs en cotes 2/2 (2 end, 2 env).",
    "pattern.circumferenceNote": "Circonference totale : {0} cm. Utilisez des aiguilles circulaires de 80 cm minimum.",
    "pattern.continueStockinette": "Continuer en jersey endroit (tricoter toutes les mailles a l'endroit) pendant {0} rangs.",
    "pattern.bodyHeightNote": "Hauteur du corps avant emmanchures : environ {0} cm",
    "pattern.armholeSeparation": "Separation pour emmanchures : Tricoter {0} m. (dos), mettre {1} m. en attente (dessous de bras gauche), tricoter {2} m. (devant), mettre {3} m. en attente (dessous de bras droit), tricoter jusqu'au marqueur.",
    "pattern.stitchesOnHold": "Les mailles en attente seront jointes aux manches plus tard.",
    "pattern.markerNote": "Placer un marqueur au milieu du devant et au milieu du dos pour reperer les \"coutures\" laterales.",

    // Yoke
    "pattern.yoke": "Empiecement",
    "pattern.raglanYoke": "Empiecement raglan : Continuer en rond sur les {0} m. du corps. A chaque rang, diminuer 1 m. de chaque cote des 4 lignes de raglan (8 dim. par rang). Repeter pendant {1} rangs.",
    "pattern.raglanMarkers": "Placer 4 marqueurs pour les lignes de raglan.",
    "pattern.necklineRemaining": "Encolure : Il reste environ {0} m. Tricoter la bordure d'encolure en cotes 1/1 pendant 2-3 cm, puis rabattre souplement.",
    "pattern.backAndFrontSeparate": "Devant et dos separement : Continuer le dos sur {0} m. Diminuer 1 m. de chaque cote tous les 2 rangs, 3-4 fois pour arrondir les emmanchures.",
    "pattern.continueStraightUntil": "Continuer droit jusqu'a {0} rangs depuis la separation.",
    "pattern.shouldersBindOff": "Epaules : Rabattre {0} m. de chaque cote en 2-3 fois. Rabattre les {1} m. centrales pour l'encolure dos. Repeter pour le devant en creusant l'encolure 2 cm plus tot.",
    "pattern.pickUpNeckCrewneck": "Relever les mailles autour de l'encolure et tricoter 2-3 cm de cotes 1/1.",
    "pattern.pickUpNeckVneck": "Relever les mailles le long du V et tricoter une bordure de cotes 1/1.",

    // Sleeves seamless
    "pattern.sleeveX2InRound": "Manche (x2, en rond)",
    "pattern.noSleeves": "Sans manches - bordure d'emmanchure seulement.",
    "pattern.armholeBorderNote": "Relever les mailles autour de l'emmanchure et tricoter quelques rangs de cotes, puis rabattre.",
    "pattern.pickUpSleeve": "Relever {0} m. autour de l'emmanchure, puis tricoter les {1} m. en attente du dessous de bras. Total : {2} m. Joindre en rond, placer un marqueur au centre du dessous de bras.",
    "pattern.dpnNote": "Utiliser des aiguilles double-pointes ou magic loop pour les petites circonferences.",
    "pattern.sleeveDecrease": "Diminutions : {0}. On obtient {1} m.",
    "pattern.decreaseNote": "Diminuer avec SSK avant le marqueur et K2tog apres.",
    "pattern.continueStockinetteFor": "Continuer en jersey pendant {0} rangs.",
    "pattern.cuffRib": "Poignet : Tricoter {0} rangs en cotes 2/2 sur les {1} m. Rabattre souplement en cotes.",
    "pattern.knitTwoIdentical": "Tricoter 2 manches identiques.",

    // Flat pieces - back
    "pattern.back": "Dos",
    "pattern.castOnRib": "Monter {0} mailles. Tricoter {1} rangs en cotes 2/2 (2 end, 2 env).",
    "pattern.ribHeightNote": "Hauteur des cotes : environ {0} cm",
    "pattern.continueStockinetteRows": "Continuer en jersey endroit pendant {0} rangs.",
    "pattern.armholeBindOff": "Emmanchures : Rabattre {0} mailles au debut des 2 prochains rangs. Il reste {1} mailles.",
    "pattern.armholeDecrease": "Diminuer 1 maille de chaque cote tous les 2 rangs, {0} fois. Il reste {1} mailles.",
    "pattern.continueStraightRows": "Continuer droit pendant {0} rangs jusqu'a l'epaule.",
    "pattern.shoulderBindOff": "Epaules : Rabattre {0} mailles au debut des 4 prochains rangs. Rabattre les {1} mailles centrales pour l'encolure dos.",
    "pattern.raglanNote": "Placer des marqueurs pour les lignes de raglan",
    "pattern.shoulderSimple": "Epaules : Rabattre {0} mailles de chaque cote, puis rabattre les mailles centrales pour l'encolure.",

    // Flat pieces - front
    "pattern.front": "Devant",
    "pattern.frontLeft": "Devant gauche",
    "pattern.frontRight": "Devant droit",
    "pattern.frontNeckNote": "encolure devant (commencer 3-4 cm plus tot que le dos)",
    "pattern.buttonBandNote": "Note : Les {0} premieres mailles cote ouverture restent en cotes 2/2 pour la bande de boutonnage.",
    "pattern.buttonholeRow": "Boutonnieres : Au rang {0}, puis tous les {1} rangs, faire une boutonniere (2 m. ens., jete).",
    "pattern.buttonholeTotal": "{0} boutonnieres au total",
    "pattern.buttonholeNote": "Prevoir {0} boutonnieres espacees d'environ {1} rangs.",
    "pattern.continueExceptButtonBand": "Continuer en jersey (sauf bande boutonnage) pendant {0} rangs.",
    "pattern.armholeBindOffSide": "Emmanchure : Rabattre {0} mailles cote exterieur au prochain rang {1}.",
    "pattern.rsRow": "endroit",
    "pattern.wsRow": "envers",
    "pattern.vneckDecrease": "Col V : Diminuer 1 m. cote encolure tous les 4 rangs jusqu'a l'epaule.",
    "pattern.neckBindOff": "Encolure : Rabattre {0} m. cote encolure, puis dim. 1 m. tous les 2 rangs, 3 fois.",

    // Flat sleeves
    "pattern.sleeveX2": "Manche (x2)",
    "pattern.noSleeveSimple": "Sans manches",
    "pattern.castOnCuff": "Monter {0} mailles. Tricoter {1} rangs en cotes 2/2.",
    "pattern.wristNote": "Poignet : environ {0} cm",
    "pattern.sleeveIncrease": "{0}. On obtient {1} mailles.",
    "pattern.sleeveLengthNote": "Longueur manche : environ {0} cm",
    "pattern.sleeveCapStart": "Tete de manche : Rabattre {0} mailles au debut des 2 prochains rangs.",
    "pattern.bindOffRemaining": "Rabattre les mailles restantes.",

    // Neckline
    "pattern.crewneckBindOff": "Encolure ras du cou : Rabattre les {0} mailles centrales.",
    "pattern.crewneckDecrease": "Continuer chaque cote separement, en diminuant 1 maille cote encolure tous les 2 rangs, 3 fois.",
    "pattern.crewneckBorder": "Relever les mailles tout autour de l'encolure et tricoter 2-3 cm de cotes 1/1.",
    "pattern.vneckDivide": "Col V : A la hauteur souhaitee, diviser le travail en deux.",
    "pattern.vneckDecreaseInstr": "Diminuer 1 maille cote encolure tous les 4 rangs jusqu'a l'epaule.",
    "pattern.vneckBorder": "Relever les mailles le long du V et tricoter une bande de cotes 1/1.",
    "pattern.boatNeckBindOff": "Encolure bateau : Rabattre toutes les mailles d'un coup sur une largeur de {0} cm.",
    "pattern.boatNeckNote": "Pas de finition necessaire, les epaules sont plus larges.",
    "pattern.openNeck": "Encolure ouverte : Continuer la bande de boutonnage jusqu'en haut.",
    "pattern.openNeckDecrease": "Diminuer progressivement 1 maille cote encolure tous les 4-6 rangs pour arrondir legerement.",
    "pattern.hoodPickUp": "Ne pas fermer l'encolure. Relever les mailles tout autour.",
    "pattern.hoodKnit": "Tricoter la capuche en jersey sur environ 30-35 cm.",
    "pattern.hoodSeam": "Plier en deux et coudre le haut, ou grafting pour une finition invisible.",
    "pattern.defaultNeckBindOff": "Rabattre les {0} mailles centrales pour l'encolure.",
    "pattern.finishShoulders": "Finir les epaules de chaque cote.",

    // Assembly
    "pattern.seamlessNote1": "Le corps est deja tricote en rond - pas de coutures laterales !",
    "pattern.seamlessNote2": "Les manches sont tricotees en rond depuis l'emmanchure - pas de couture de manche !",
    "pattern.seamlessNote3": "Seule finition : rentrer les fils au niveau des jonctions dessous de bras.",
    "pattern.seamlessNote4": "Bloquer le vetement termine aux dimensions.",
    "pattern.flatNote1": "Bloquer toutes les pieces aux dimensions.",
    "pattern.flatNote2": "Coudre les epaules (couture invisible ou grafting).",
    "pattern.flatNote3Sleeves": "Monter les manches en alignant le centre de la tete de manche avec la couture d'epaule.",
    "pattern.flatNote4Sleeves": "Coudre les cotes du corps et les dessous de manches en une seule couture.",
    "pattern.flatNote3NoSleeves": "Coudre les cotes du corps.",
    "pattern.flatNote5": "Relever les mailles de l'encolure et tricoter la bordure.",

    // Finishing
    "pattern.weavEnds": "Rentrer tous les fils soigneusement.",
    "pattern.blockGarment": "Bloquer le vetement fini a l'eau tiede.",
    "pattern.sewButtons": "Coudre {0} boutons en face des boutonnieres.",
    "pattern.sewZipper": "Coudre la fermeture eclair sur les bandes de devant.",

    // Disclaimer
    "pattern.constructionSeamless": "Ce patron utilise une construction en rond pour minimiser les coutures.",
    "pattern.constructionFlat": "Ce patron utilise des pieces a plat a assembler.",
    "pattern.disclaimerIntro": "Ce patron a ete genere automatiquement par La Maille a partir d'une analyse d'image.",
    "pattern.disclaimerWork": "Il constitue une base de travail et peut necessiter des ajustements selon :",
    "pattern.disclaimerSwatch": "Votre echantillon reel (TOUJOURS faire un echantillon !)",
    "pattern.disclaimerYarn": "La souplesse ou rigidite de votre fil",
    "pattern.disclaimerFit": "Vos preferences de coupe",
    "pattern.disclaimerConfidence": "Confiance de l'analyse : {0}",
    "pattern.disclaimerLimitations": "Limitations identifiees : {0}",
    "pattern.disclaimerAdvice": "En cas de doute, consultez un patron commercial similaire pour comparaison.",
  },

  en: {
    // Header
    siteName: "LA MAILLE",
    tagline: "From photo to pattern",

    // Home page
    homeTitle: "From photo to pattern",
    homeSubtitle:
      "Upload a photo of any knitted garment. La Maille reads it and creates a custom pattern just for you.",
    homeUploadTitle: "Drop your photo here",
    homeUploadSubtitle: "or click to select",
    homeUploadFormats: "JPG, PNG or WebP - Max 10MB",
    homeUploadButton: "Choose a photo",
    homeHowItWorks: "How it works",
    homeLimitations: "My limits",

    // Analysis page
    analyzeTitle: "Read and create",
    analyzeSubtitle:
      "Review what I see and enter your parameters to create your pattern",
    sourceImage: "Your photo",
    changeImage: "Change",
    analyzing: "Reading your knit...",
    analysisError: "Reading error",
    retry: "Retry",
    otherImage: "Other photo",
    imageNotAnalyzable: "I couldn't read this image",
    tryAnotherImage: "Try another photo",
    analysis: "What I see",
    limitations: "My limits",
    yourParameters: "Your parameters",
    analysisInProgress: "Reading in progress",
    formWillAppear: "The form will appear once I finish reading your photo.",
    analysisImpossible: "Reading impossible",
    tryWithAnotherPhoto:
      "Try with another photo, well-lit and clearly showing the garment from the front.",
    waiting: "Waiting",
    analysisWillStart: "Reading will start automatically.",

    // Form
    gauge: "Gauge",
    whyEssential: "Why is this essential?",
    gaugeExplanation:
      "The gauge determines all dimensions. Without it, the pattern will be wrong.",
    gaugeDescription: "Knit with your yarn and needles, wash and block",
    stitchesPer10cm: "Stitches per 10cm",
    rowsPer10cm: "Rows per 10cm",
    needleSize: "Needles (mm)",
    measurements: "Measurements",
    measurementsDescription:
      "Measure yourself or a garment that fits you well",
    chestCircumference: "Chest circumference",
    bodyLength: "Body length",
    shoulderWidth: "Shoulder width",
    armLength: "Arm length",
    wristCircumference: "Wrist circumference",
    bicepCircumference: "Bicep circumference",
    ease: "Ease",
    easeDescription: "Extra width added to the pattern",
    fitted: "Fitted",
    regular: "Regular",
    oversized: "Oversized",
    finishedChest: "Finished chest",
    yarn: "Yarn",
    yarnWeight: "Yarn weight",
    composition: "Composition (optional)",
    compositionPlaceholder: "E.g.: 100% merino",
    generatePattern: "Create my pattern",
    generating: "Creating...",
    howToMeasure: "How to take my measurements?",
    measurementGuide: "Measurement guide",
    measurementGuideDesc: "Take your measurements on your body, in underwear, without pulling tight.",
    chestMeasureDesc: "Measure at the widest point, under the armpits, keeping the tape horizontal.",
    bodyLengthMeasureDesc: "From the highest point of the shoulder to the desired length (hips, mid-thigh...).",
    shoulderWidthMeasureDesc: "From one shoulder edge to the other, passing through the nape.",
    armLengthMeasureDesc: "From shoulder to wrist, arm slightly bent.",
    wristMeasureDesc: "Above the wrist bone.",
    bicepMeasureDesc: "At the widest point of the arm, relaxed.",
    easeAriaLabel: "Ease in centimeters",
    fittedRange: "Fitted (0-5)",
    regularRange: "Regular (5-10)",
    oversizedRange: "Oversized (10-20)",

    // Pattern page
    yourPattern: "Your pattern",
    generatedOn: "Generated on",
    disclaimer:
      "This pattern is an automatic ESTIMATE. It has not been tested.",
    verifyAndSwatch:
      "Verify your calculations and knit a swatch before starting.",
    close: "Close",
    projectSummary: "Project summary",
    type: "Type",
    construction: "Construction",
    calculatedSize: "Calculated size",
    chestLabel: "cm chest",
    materialsNeeded: "Materials needed",
    yarnLabel: "Yarn",
    estimate: "estimate",
    needles: "Needles",
    circularMin: "circular 80 cm min",
    accessories: "Accessories",
    accessoriesList: "Tapestry needle, markers, scissors",
    buttons: "Buttons",
    buttonsDescription: "buttons approx. 1.5-2 cm",
    zipper: "Zipper",
    zipperSeparable: "Separating zipper",
    patternInstructions: "Pattern instructions",
    touchToExpand: "Touch each section to see details",
    assembly: "Assembly",
    finishing: "Finishing",
    couldNotDetermine: "What could not be determined with certainty",
    requiresJudgment:
      "These elements require your judgment or consultation of a dedicated pattern.",
    sharePDF: "Share PDF",
    downloadPDF: "Download PDF",
    download: "Download",
    restart: "Start over",
    reportProblem: "Report a problem",
    generatingPDF: "Generating...",
    loading: "Loading...",

    // WeavingLoader messages
    loaderReceivingImage: "Receiving your image...",
    loaderReadingKnit: "Reading your knit...",
    loaderWeavingPattern: "Weaving your pattern...",
    loaderSaving: "Saving...",
    couldntReadThis: "Hmm, I couldn't read this one",
    tipsForGoodPhoto: "Tips for a good photo:",
    tipLayFlat: "Lay the garment flat or on a hanger",
    tipGoodLighting: "Good lighting, no shadows",
    tipSingleItem: "Single item, full view",
    tryWithAnotherPhotoBtn: "Try with another photo",

    // Garment types
    "garment.pull": "Sweater",
    "garment.cardigan": "Cardigan",
    "garment.gilet": "Vest",
    "garment.autre": "Other",
    "garment.unknown": "Unknown",

    // Construction methods
    "construction.en-rond": "In the round",
    "construction.pieces-assemblees": "Assembled pieces",
    "construction.top-down": "Top-down",
    "construction.bottom-up": "Bottom-up",
    "construction.raglan": "Raglan",
    "construction.side-to-side": "Side to side",
    "construction.unknown": "Unknown",

    // Necklines
    "neckline.ras-du-cou": "Crew neck",
    "neckline.col-v": "V-neck",
    "neckline.col-rond": "Round neck",
    "neckline.col-bateau": "Boat neck",
    "neckline.col-roule": "Turtleneck",
    "neckline.capuche": "Hood",
    "neckline.bateau": "Boat neck",
    "neckline.ouvert-cardigan": "Open (cardigan)",
    "neckline.unknown": "Unknown",

    // Sleeve types
    "sleeve.montees": "Set-in",
    "sleeve.raglan": "Raglan",
    "sleeve.marteau": "Drop shoulder",
    "sleeve.sans-manches": "Sleeveless",
    "sleeve.unknown": "Unknown",

    // Sleeve lengths
    "sleeve-length.longues": "Long",
    "sleeve-length.3-4": "3/4",
    "sleeve-length.courtes": "Short",
    "sleeve-length.sans": "None",
    "sleeve-length.unknown": "Unknown",

    // Stitch patterns
    "stitch.jersey": "Stockinette",
    "stitch.cotes": "Ribbing",
    "stitch.mousse": "Garter stitch",
    "stitch.torsades": "Cables",
    "stitch.jacquard": "Colorwork",
    "stitch.dentelle": "Lace",
    "stitch.autre": "Other",
    "stitch.unknown": "Unknown",

    // Fit styles
    "fit.ajuste": "Fitted",
    "fit.regular": "Regular",
    "fit.oversized": "Oversized",
    "fit.unknown": "Unknown",

    // Confidence levels
    "confidence.high": "High confidence",
    "confidence.medium": "Medium confidence",
    "confidence.low": "Low confidence",
    "confidence.insufficient": "Insufficient",

    // Yarn weights
    "yarn.lace": "Lace",
    "yarn.fingering": "Fingering",
    "yarn.sport": "Sport",
    "yarn.dk": "DK",
    "yarn.worsted": "Worsted",
    "yarn.aran": "Aran",
    "yarn.bulky": "Bulky",

    // Messages
    analysisComplete: "Analysis complete",
    fillFormToGenerate: "Fill in the form to generate your pattern.",
    patternGenerated: "Pattern generated successfully!",
    pdfDownloaded: "PDF downloaded!",
    pdfShared: "PDF shared!",
    preparingShare: "Preparing to share...",
    generatingPDFMessage: "Generating PDF...",
    mayTakeFewSeconds: "This may take a few seconds.",
    pdfGenerationError: "Error generating PDF",
    pleaseRetry: "Please try again.",
    shareError: "Error sharing",
    pdfDownloadedInstead: "The PDF was downloaded instead.",
    complexStitchDetected: "Complex stitch detected",
    limitationsFromAnalysis: "(from original analysis)",

    // Footer
    footerMadeWith: "Made with love in Paris",
    footerDisclaimer: "Patterns are estimates - always verify your calculations",

    // Analysis labels
    neckline: "Neckline",
    sleeves: "Sleeves",
    stitch: "Stitch",
    fit: "Fit",
    confidenceLabel: "Confidence",

    // Garment overlay validation
    doesThisMatchYourGarment: "Does this match your garment?",
    yesConfirm: "Yes, continue",
    noTryAgain: "No, try again",
    whatDoesNotMatch: "What doesn't match?",
    necklineIssue: "The neckline",
    sleevesIssue: "The sleeves",
    shapeIssue: "The overall shape",
    isCardigan: "It's a cardigan, not a sweater",
    isNotCardigan: "It's a sweater, not a cardigan",
    back: "Back",
    validateAnalysis: "Validate analysis",
    yourPhoto: "Your photo",
    whatIUnderstood: "What I understood",
    confidenceHigh: "High confidence",
    confidenceMedium: "Medium confidence",
    confidenceLow: "Low confidence",
    uncertain: "Uncertain",

    // Knitting mode
    knittingMode: "Knitting mode",
    launchKnitting: "Start knitting",
    exitKnitting: "Exit",
    panel: "Panel",
    row: "Row",
    previousRow: "Previous row",
    nextRow: "Next row",
    markerHere: "Marker here",
    addMarker: "Add marker",
    markerNote: "Note (optional)",
    markerAdded: "Marker added",
    nightMode: "Night mode",
    pieceBack: "Back",
    pieceFront: "Front",
    pieceLeftSleeve: "Left sleeve",
    pieceRightSleeve: "Right sleeve",
    pieceFrontLeft: "Left front",
    pieceFrontRight: "Right front",
    pieceBody: "Body",
    pieceYoke: "Yoke",
    pieceNeckline: "Neckline",
    pieceSleeves: "Sleeves",
    decreaseInRows: "Decrease in {0} rows",
    increaseInRows: "Increase in {0} rows",
    decreaseNow: "Decrease now!",
    increaseNow: "Increase now!",
    sectionComplete: "Section complete!",
    goToNext: "Go to",
    resumeKnitting: "Resume where you left off?",
    resumeAt: "Resume at row",
    startOver: "Start over",
    progressLabel: "Progress",
    rowOf: "of",
    completedLabel: "Completed",
    markersLabel: "Markers",
    noMarkers: "No markers",
    deleteMarker: "Delete",
    currentInstruction: "Current instruction",
    contextLabel: "Context",
    swipeHint: "Swipe to change row",
    patternNotFound: "Pattern not found",
    goBackToPattern: "Go back to pattern",

    // Knit mode
    knitModeTitle: "Knit mode",
    documentModeTitle: "Full pattern",
    knitModeWelcomeBack: "Welcome back!",
    knitModeContinueFrom: "Continue from row {row}?",
    knitModeContinue: "Continue",
    knitModeComplete: "complete",

    // Gauge checker
    gaugeCheckerTitle: "Check your gauge swatch",
    gaugeCheckerDesc: "Compare your knitted swatch with the reference square",
    gaugeCheckerInstructions: "Place your swatch on the screen. The edges should match the square.",
    swatchSmaller: "My swatch is smaller",
    swatchLarger: "My swatch is larger",
    swatchCorrect: "It matches!",
    gaugeCorrectTitle: "Perfect!",
    gaugeCorrectDesc: "Your swatch matches. You can continue with these values.",
    gaugeTighterTitle: "Tighter gauge",
    gaugeTighterDesc: "Your gauge is tighter than expected. Try larger needles (+0.5mm) or adjust your values.",
    gaugeLooserTitle: "Looser gauge",
    gaugeLooserDesc: "Your gauge is looser than expected. Try smaller needles (-0.5mm) or adjust your values.",
    checkAgain: "Check again",
    calibrateScreen: "Calibrate screen for more accuracy",
    recalibrateScreen: "Recalibrate screen",
    calibrated: "Calibrated",
    calibrationInstructions: "Place a credit card on the rectangle and adjust until the edges match.",
    calibrationAdjust: "Adjust with the slider below",
    creditCard: "Credit card",
    smaller: "Smaller",
    larger: "Larger",
    saveCalibration: "Save",
    cancel: "Cancel",
    swatchNote: "The swatch should be washed and blocked before measuring, exactly like the finished garment will be.",
    checkSwatchVisually: "Check my swatch visually",

    // Yarn calculator
    yarnCalculator: "Yarn calculator",
    yarnCalculatorDesc: "How much yarn do you have?",
    dontKnowYetYarn: "I don't know yet",
    standardEstimate: "Standard estimate based on your measurements",
    haveMyYarn: "I have my yarn already",
    numberOfSkeins: "Number of skeins",
    metersPerSkein: "Meters per skein",
    total: "total",
    estimatedYarnNeeded: "Estimated yarn needed",
    yarnNeeded: "Yarn needed",
    yourYarnStock: "Your stock",
    yarnSufficient: "You have enough yarn!",
    yarnSufficientFull: "You have enough yarn! (Estimated need: {0}m)",
    yarnTight: "It's a bit tight",
    yarnTightFull: "It's a bit tight. Consider getting one more skein to be safe.",
    yarnInsufficient: "You're short about {0}m",
    yarnInsufficientFull: "You'll be short about {0}m.",
    suggestionsToAdjust: "Suggestions to adjust:",
    adjustBodyLength: "Shorten body by {0}cm (-{1}m)",
    adjustSleeveLength: "Shorten sleeves by {0}cm (-{1}m)",
    adjustEase: "Reduce ease by {0}cm (-{1}m)",
    applyAdjustments: "Apply selected adjustments",
    adjustmentsApplied: "Adjustments applied!",
    patternAdjustedForYarn: "Pattern adjusted for your yarn stock",
    yarnEstimateDisclaimer: "Yardage is an estimate. Every knitter has different tension. When in doubt, always get one more skein!",

    // Size presets
    chooseABase: "Choose a base",
    startFromStandardSize: "Start from a standard size",
    customMeasurements: "Custom measurements",
    basedOnSize: "Based on size",
    modified: "(modified)",
    standardValue: "Standard value",
    youEntered: "You entered",
    noNeedForPrecision: "No need for millimeter precision! Approximate values are fine.",
    hipCircumference: "Hip circumference",

    // Image uploader
    dropImageHere: "Drop image here",
    dragPhotoHere: "Drag a photo here",
    or: "or",
    browseFiles: "Browse files",
    maxSize: "JPG, PNG or WebP - Max 10 MB",
    changeImageBtn: "Change image",
    analyzeThisImage: "Analyze this image",
    analyzingBtn: "Analyzing...",
    dropZoneLabel: "Image drop zone. Click or drop an image.",
    photoTipsTitle: "Tips for a good photo:",
    photoTipFront: "Front view, well-lit",
    photoTipHanger: "On hanger or flat",
    photoTipAlone: "Garment alone",
    retryWithAnotherPhoto: "Try with another photo",
    imageUploadSuccess: "Image loaded successfully",
    imageUploadError: "Error loading image",

    // Auto-save
    saving: "Saving...",
    saved: "Saved",
    projectInProgress: "Project in progress",
    resumeProjectQuestion: "You have a project in progress. Do you want to resume it?",
    resumeProject: "Resume",
    newProject: "New project",

    // Home page steps
    step: "Step",
    step1Title: "Upload your inspiration",
    step1Desc: "A front view of the garment, well-lit",
    step2Title: "La Maille reads the knit",
    step2Desc: "Identifying the shape, proportions and stitches",
    step3Title: "Enter your measurements",
    step3Desc: "Chest circumference, length, and your gauge",
    step4Title: "Get your custom pattern",
    step4Desc: "Row by row instructions, adapted to you",

    // Capabilities
    whatICanDo: "What I can do",
    myLimits: "My limits (for now)",
    basicSweaters: "Basic sweaters and cardigans",
    basicStitches: "Stockinette, ribbing, garter stitch",
    adaptedCalcs: "Calculations adapted to YOUR gauge",
    cablesLimit: "Cables: I spot them but can't reproduce the chart",
    colorworkLimit: "Colorwork: shape yes, design no",
    laceLimit: "Complex lace",
    experimentalLimit: "Experimental constructions",

    // Pattern instructions
    "pattern.stitchesFor": "Stitches for {0} cm",
    "pattern.rowsFor": "Rows for {0} cm",
    "pattern.roundedFrom": "Rounded from {0} to {1}",
    "pattern.knitStraightNoDecrease": "Knit straight without decreases",
    "pattern.knitStraightNoIncrease": "Knit straight without increases",
    "pattern.decreaseEverySide": "Decrease 1 stitch each side every {0} rows, {1} times",
    "pattern.decreaseRemaining": "({0} remaining rows to knit straight)",
    "pattern.decreaseEveryRs": "Decrease 1 stitch each side every RS row, {0} times",
    "pattern.increaseEverySide": "Increase 1 stitch each side every {0} rows, {1} times",
    "pattern.increaseStart": "(start after {0} rows)",
    "pattern.increaseEveryRs": "Increase 1 stitch each side every RS row, {0} times",

    // Seamless body
    "pattern.bodyInRound": "Body (in the round)",
    "pattern.castOnCircular": "Cast on {0} stitches on circular needles. Join in the round being careful not to twist. Place a marker for the beginning of round. Work {1} rows in 2x2 rib (k2, p2).",
    "pattern.circumferenceNote": "Total circumference: {0} cm. Use circular needles at least 80 cm long.",
    "pattern.continueStockinette": "Continue in stockinette stitch (knit all stitches) for {0} rows.",
    "pattern.bodyHeightNote": "Body height before armholes: approximately {0} cm",
    "pattern.armholeSeparation": "Armhole separation: Knit {0} sts (back), place {1} sts on hold (left underarm), knit {2} sts (front), place {3} sts on hold (right underarm), knit to marker.",
    "pattern.stitchesOnHold": "Held stitches will be joined to sleeves later.",
    "pattern.markerNote": "Place a marker at center front and center back to mark side \"seams\".",

    // Yoke
    "pattern.yoke": "Yoke",
    "pattern.raglanYoke": "Raglan yoke: Continue in the round on {0} body sts. Every round, decrease 1 st each side of all 4 raglan lines (8 dec per round). Repeat for {1} rounds.",
    "pattern.raglanMarkers": "Place 4 markers for raglan lines.",
    "pattern.necklineRemaining": "Neckline: About {0} sts remain. Work neckband in 1x1 rib for 2-3 cm, then bind off loosely.",
    "pattern.backAndFrontSeparate": "Back and front separately: Continue back on {0} sts. Decrease 1 st each side every 2 rows, 3-4 times to shape armholes.",
    "pattern.continueStraightUntil": "Continue straight until {0} rows from separation.",
    "pattern.shouldersBindOff": "Shoulders: Bind off {0} sts each side in 2-3 steps. Bind off center {1} sts for back neck. Repeat for front, starting neck shaping 2 cm earlier.",
    "pattern.pickUpNeckCrewneck": "Pick up stitches around neckline and work 2-3 cm of 1x1 rib.",
    "pattern.pickUpNeckVneck": "Pick up stitches along the V and work a 1x1 rib border.",

    // Sleeves seamless
    "pattern.sleeveX2InRound": "Sleeve (x2, in the round)",
    "pattern.noSleeves": "Sleeveless - armhole border only.",
    "pattern.armholeBorderNote": "Pick up stitches around armhole and work a few rows of rib, then bind off.",
    "pattern.pickUpSleeve": "Pick up {0} sts around armhole, then work {1} held underarm sts. Total: {2} sts. Join in the round, place marker at center underarm.",
    "pattern.dpnNote": "Use double-pointed needles or magic loop for small circumferences.",
    "pattern.sleeveDecrease": "Decreases: {0}. You have {1} sts.",
    "pattern.decreaseNote": "Decrease with SSK before marker and K2tog after.",
    "pattern.continueStockinetteFor": "Continue in stockinette for {0} rows.",
    "pattern.cuffRib": "Cuff: Work {0} rows in 2x2 rib on {1} sts. Bind off loosely in rib.",
    "pattern.knitTwoIdentical": "Knit 2 identical sleeves.",

    // Flat pieces - back
    "pattern.back": "Back",
    "pattern.castOnRib": "Cast on {0} stitches. Work {1} rows in 2x2 rib (k2, p2).",
    "pattern.ribHeightNote": "Rib height: approximately {0} cm",
    "pattern.continueStockinetteRows": "Continue in stockinette stitch for {0} rows.",
    "pattern.armholeBindOff": "Armholes: Bind off {0} stitches at beginning of next 2 rows. {1} stitches remain.",
    "pattern.armholeDecrease": "Decrease 1 stitch each side every 2 rows, {0} times. {1} stitches remain.",
    "pattern.continueStraightRows": "Continue straight for {0} rows to shoulder.",
    "pattern.shoulderBindOff": "Shoulders: Bind off {0} stitches at beginning of next 4 rows. Bind off center {1} stitches for back neck.",
    "pattern.raglanNote": "Place markers for raglan lines",
    "pattern.shoulderSimple": "Shoulders: Bind off {0} stitches each side, then bind off center stitches for neckline.",

    // Flat pieces - front
    "pattern.front": "Front",
    "pattern.frontLeft": "Left front",
    "pattern.frontRight": "Right front",
    "pattern.frontNeckNote": "front neckline (start 3-4 cm earlier than back)",
    "pattern.buttonBandNote": "Note: First {0} stitches on opening side remain in 2x2 rib for button band.",
    "pattern.buttonholeRow": "Buttonholes: At row {0}, then every {1} rows, make a buttonhole (k2tog, yo).",
    "pattern.buttonholeTotal": "{0} buttonholes total",
    "pattern.buttonholeNote": "Plan for {0} buttonholes spaced about {1} rows apart.",
    "pattern.continueExceptButtonBand": "Continue in stockinette (except button band) for {0} rows.",
    "pattern.armholeBindOffSide": "Armhole: Bind off {0} stitches on outside edge at next {1} row.",
    "pattern.rsRow": "RS",
    "pattern.wsRow": "WS",
    "pattern.vneckDecrease": "V-neck: Decrease 1 st at neck edge every 4 rows to shoulder.",
    "pattern.neckBindOff": "Neckline: Bind off {0} sts at neck edge, then dec 1 st every 2 rows, 3 times.",

    // Flat sleeves
    "pattern.sleeveX2": "Sleeve (x2)",
    "pattern.noSleeveSimple": "Sleeveless",
    "pattern.castOnCuff": "Cast on {0} stitches. Work {1} rows in 2x2 rib.",
    "pattern.wristNote": "Wrist: approximately {0} cm",
    "pattern.sleeveIncrease": "{0}. You have {1} stitches.",
    "pattern.sleeveLengthNote": "Sleeve length: approximately {0} cm",
    "pattern.sleeveCapStart": "Sleeve cap: Bind off {0} stitches at beginning of next 2 rows.",
    "pattern.bindOffRemaining": "Bind off remaining stitches.",

    // Neckline
    "pattern.crewneckBindOff": "Crew neck: Bind off center {0} stitches.",
    "pattern.crewneckDecrease": "Continue each side separately, decreasing 1 stitch at neck edge every 2 rows, 3 times.",
    "pattern.crewneckBorder": "Pick up stitches around neckline and work 2-3 cm of 1x1 rib.",
    "pattern.vneckDivide": "V-neck: At desired height, divide work in two.",
    "pattern.vneckDecreaseInstr": "Decrease 1 stitch at neck edge every 4 rows to shoulder.",
    "pattern.vneckBorder": "Pick up stitches along the V and work a 1x1 rib band.",
    "pattern.boatNeckBindOff": "Boat neck: Bind off all stitches at once over a width of {0} cm.",
    "pattern.boatNeckNote": "No finishing needed, shoulders are wider.",
    "pattern.openNeck": "Open neckline: Continue button band to top.",
    "pattern.openNeckDecrease": "Gradually decrease 1 stitch at neck edge every 4-6 rows to slightly round.",
    "pattern.hoodPickUp": "Do not close neckline. Pick up stitches all around.",
    "pattern.hoodKnit": "Knit hood in stockinette for approximately 30-35 cm.",
    "pattern.hoodSeam": "Fold in half and seam the top, or use grafting for an invisible finish.",
    "pattern.defaultNeckBindOff": "Bind off center {0} stitches for neckline.",
    "pattern.finishShoulders": "Finish shoulders on each side.",

    // Assembly
    "pattern.seamlessNote1": "Body is already knit in the round - no side seams!",
    "pattern.seamlessNote2": "Sleeves are knit in the round from the armhole - no sleeve seam!",
    "pattern.seamlessNote3": "Only finishing: weave in ends at underarm joins.",
    "pattern.seamlessNote4": "Block finished garment to measurements.",
    "pattern.flatNote1": "Block all pieces to measurements.",
    "pattern.flatNote2": "Seam shoulders (invisible seam or grafting).",
    "pattern.flatNote3Sleeves": "Set in sleeves, aligning center of sleeve cap with shoulder seam.",
    "pattern.flatNote4Sleeves": "Seam body sides and underarms in one continuous seam.",
    "pattern.flatNote3NoSleeves": "Seam body sides.",
    "pattern.flatNote5": "Pick up neckline stitches and work border.",

    // Finishing
    "pattern.weavEnds": "Weave in all ends carefully.",
    "pattern.blockGarment": "Block finished garment in lukewarm water.",
    "pattern.sewButtons": "Sew {0} buttons opposite buttonholes.",
    "pattern.sewZipper": "Sew zipper to front bands.",

    // Disclaimer
    "pattern.constructionSeamless": "This pattern uses seamless construction to minimize seams.",
    "pattern.constructionFlat": "This pattern uses flat pieces to be assembled.",
    "pattern.disclaimerIntro": "This pattern was automatically generated by La Maille from image analysis.",
    "pattern.disclaimerWork": "It is a working base and may need adjustments based on:",
    "pattern.disclaimerSwatch": "Your actual gauge (ALWAYS make a swatch!)",
    "pattern.disclaimerYarn": "The drape or stiffness of your yarn",
    "pattern.disclaimerFit": "Your fit preferences",
    "pattern.disclaimerConfidence": "Analysis confidence: {0}",
    "pattern.disclaimerLimitations": "Identified limitations: {0}",
    "pattern.disclaimerAdvice": "When in doubt, consult a similar commercial pattern for comparison.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["fr"];

export function useTranslation() {
  const { language, setLanguage } = useI18n();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language, setLanguage };
}

/**
 * Get translation for a specific language (for use outside React components)
 */
export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || key;
}

/**
 * Translate with parameters (for pattern generation)
 * Usage: tp(language, "pattern.castOnCircular", 120, 20)
 * Will replace {0} with 120, {1} with 20, etc.
 */
export function tp(language: Language, key: TranslationKey, ...args: (string | number)[]): string {
  let text: string = translations[language][key] || key;
  args.forEach((arg, index) => {
    text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
  });
  return text;
}

/**
 * Translate common French limitation phrases to English
 */
const limitationTranslations: Record<string, string> = {
  "Impossible de voir les détails de construction précis": "Unable to see precise construction details",
  "Angle de vue limité pour confirmer le type exact de manche": "Limited viewing angle to confirm exact sleeve type",
  "Qualité d'image ne permet pas de distinguer finement le point utilisé": "Image quality doesn't allow distinguishing the exact stitch pattern",
  "Ne peut pas voir l'arrière du vêtement": "Cannot see the back of the garment",
  "Construction exacte difficile à déterminer": "Exact construction difficult to determine",
  "Détails des emmanchures non visibles": "Armhole details not visible",
  "Type de col difficile à identifier": "Collar type difficult to identify",
  "Longueur des manches incertaine": "Sleeve length uncertain",
  "Motif de point complexe": "Complex stitch pattern",
  "Fermeture non visible": "Closure not visible",
};

export function translateLimitation(text: string, language: Language): string {
  if (language === "fr") return text;

  // Try exact match first
  if (limitationTranslations[text]) {
    return limitationTranslations[text];
  }

  // Try partial match
  for (const [fr, en] of Object.entries(limitationTranslations)) {
    if (text.toLowerCase().includes(fr.toLowerCase().substring(0, 20))) {
      return en;
    }
  }

  // Return original if no translation found
  return text;
}
