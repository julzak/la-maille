import { createContext, useContext } from "react";
import { create } from "zustand";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  getPathLocale,
  readLanguageFromCookieString,
  type Language,
} from "./i18n/detect";

export type { Language };

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

function getInitialLanguage(): Language {
  if (typeof document !== "undefined") {
    // Sur les pages marketing, l'URL fait foi (EN racine, FR sous /fr) :
    // garantit une hydratation cohérente avec le SSR piloté par l'URL.
    const fromPath = getPathLocale(window.location.pathname);
    if (fromPath) return fromPath;
    const fromCookie = readLanguageFromCookieString(document.cookie);
    if (fromCookie) return fromCookie;
  }
  return "en";
}

export const useI18n = create<I18nState>()((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    set({ language });
    if (typeof document !== "undefined") {
      document.cookie = `${LANG_COOKIE}=${language}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
      document.documentElement.lang = language;
    }
  },
}));

// Translations
export const translations = {
  fr: {
    // Header
    siteName: "LA MAILLE",
    tagline: "De la photo au patron",

    // Home page
    homeTitle: "Transformez n'importe quel pull en VOTRE patron",
    homeSubtitle:
      "Uploadez une photo de n'importe quel vêtement tricoté. La Maille la lit et crée un patron sur-mesure pour vous.",
    homeUploadTitle: "Glissez votre photo ici",
    homeUploadSubtitle: "ou cliquez pour sélectionner",
    homeUploadFormats: "JPG, PNG ou WebP - Max 10MB",
    homeUploadButton: "Choisir une photo",
    homeHowItWorks: "Comment ça marche",
    homeLimitations: "Mes limites",

    // Analysis page
    analyzeTitle: "Lecture et création",
    analyzeSubtitle:
      "Vérifiez ce que je vois et entrez vos paramètres pour créer le patron",
    sourceImage: "Votre photo",
    changeImage: "Changer",
    analyzing: "Je lis votre tricot...",
    analysisError: "Erreur de lecture",
    retry: "Réessayer",
    otherImage: "Autre photo",
    imageNotAnalyzable: "Je n'arrive pas a lire cette image",
    tryAnotherImage: "Essayer une autre photo",
    analysis: "Ce que je vois",
    limitations: "Mes limites",
    yourParameters: "Vos paramètres",
    analysisInProgress: "Lecture en cours",
    formWillAppear:
      "Le formulaire apparaîtra dès que j'aurai fini de lire votre photo.",
    analysisImpossible: "Lecture impossible",
    tryWithAnotherPhoto:
      "Essayez avec une autre photo, bien éclairée et montrant clairement le vêtement de face.",
    waiting: "En attente",
    analysisWillStart: "La lecture va démarrer automatiquement.",
    rateLimitAnonymous:
      "Vous avez atteint la limite de {0} analyses gratuites aujourd'hui. Créez un compte gratuit pour bénéficier de {1} analyses par jour.",
    rateLimitAuthenticated:
      "Vous avez atteint votre limite de {0} analyses aujourd'hui. Revenez demain pour continuer.",

    // Form
    gauge: "Échantillon",
    whyEssential: "Pourquoi c'est essentiel ?",
    gaugeExplanation:
      "L'échantillon détermine toutes les dimensions. Sans lui, le patron sera faux.",
    whyEssentialTitle: "Pourquoi l'échantillon est essentiel",
    whyEssentialText1: "L'échantillon est la clé d'un tricot réussi. C'est lui qui détermine toutes les dimensions de votre vêtement.",
    whyEssentialText2: "Chaque tricoteur·se a une tension différente, et chaque fil se comporte différemment. Sans échantillon, le patron sera approximatif.",
    whyEssentialText3: "Prenez le temps de tricoter un carré de 15x15 cm, lavez-le et bloquez-le comme vous le ferez pour le vêtement fini.",
    gaugeDescription: "Tricoté avec votre fil et vos aiguilles, lavé et bloqué",
    stitchesPer10cm: "Mailles pour 10cm",
    rowsPer10cm: "Rangs pour 10cm",
    needleSize: "Aiguilles (mm)",
    measurements: "Mesures",
    measurementsDescription: "Mesurez-vous ou un vêtement qui vous va bien",
    chestCircumference: "Tour de poitrine",
    bodyLength: "Longueur corps",
    shoulderWidth: "Largeur épaules",
    armLength: "Longueur bras",
    wristCircumference: "Tour de poignet",
    bicepCircumference: "Tour de biceps",
    ease: "Aisance",
    easeDescription: "Largeur supplémentaire ajoutée au patron",
    fitted: "Ajusté",
    regular: "Regular",
    oversized: "Oversized",
    finishedChest: "Poitrine finie",
    yarn: "Fil",
    yarnWeight: "Grosseur du fil",
    composition: "Composition (optionnel)",
    compositionPlaceholder: "Ex: 100% merino",
    generatePattern: "Créer mon patron",
    generating: "Création en cours...",
    howToMeasure: "Comment prendre mes mesures ?",
    measurementGuide: "Guide des mesures",
    measurementGuideDesc: "Prenez vos mesures sur le corps, en sous-vêtements, sans serrer.",
    chestMeasureDesc: "Mesurez à l'endroit le plus large, sous les aisselles, en gardant le mètre horizontal.",
    bodyLengthMeasureDesc: "Du point le plus haut de l'épaule jusqu'à la longueur souhaitée (hanches, mi-cuisses...).",
    shoulderWidthMeasureDesc: "D'un bout d'épaule à l'autre, en passant par la nuque.",
    armLengthMeasureDesc: "De l'épaule au poignet, bras légèrement plié.",
    wristMeasureDesc: "Au-dessus de l'os du poignet.",
    bicepMeasureDesc: "À l'endroit le plus large du bras, décontracté.",
    easeAriaLabel: "Aisance en centimètres",
    fittedRange: "Ajusté (0-5)",
    regularRange: "Regular (5-10)",
    oversizedRange: "Oversized (10-20)",

    // Pattern page
    yourPattern: "Votre patron",
    generatedOn: "Généré le",
    disclaimer:
      "Ce patron est une ESTIMATION automatique. Il n'a pas été testé.",
    verifyAndSwatch:
      "Vérifiez vos calculs et tricotez un échantillon avant de commencer.",
    close: "Fermer",
    projectSummary: "Résumé du projet",
    type: "Type",
    construction: "Construction",
    calculatedSize: "Taille calculée",
    chestLabel: "cm poitrine",
    materialsNeeded: "Matériel nécessaire",
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
    couldNotDetermine: "Ce qui n'a pas pu être déterminé avec certitude",
    requiresJudgment:
      "Ces éléments nécessitent votre jugement ou la consultation d'un patron dédié.",
    sharePDF: "Partager le PDF",
    downloadPDF: "Télécharger le PDF",
    printPattern: "Imprimer",
    download: "Télécharger",
    restart: "Recommencer",
    reportProblem: "Signaler un problème",
    generatingPDF: "Génération...",
    loading: "Chargement...",

    // Email gate (export PDF / impression, BRIEF-01)
    emailGateTitle: "Un email pour débloquer votre patron",
    emailGateDescription:
      "Votre patron reste lisible à l'écran sans rien donner. L'export PDF et l'impression nécessitent juste votre email.",
    emailGateEmailLabel: "Email",
    emailGateEmailPlaceholder: "vous@exemple.com",
    emailGateNewsletterLabel:
      "Recevoir des conseils tricot et les nouveautés",
    emailGateSubmit: "Déverrouiller",
    emailGateSubmitting: "Déverrouillage...",
    emailGateInvalidEmail: "Merci d'entrer une adresse email valide.",

    // WeavingLoader messages
    loaderReceivingImage: "Réception de votre image...",
    loaderReadingKnit: "Je lis votre tricot...",
    loaderWeavingPattern: "Je tisse votre patron...",
    loaderSaving: "Sauvegarde...",
    couldntReadThis: "Hmm, je n'arrive pas a lire celui-ci",
    tipsForGoodPhoto: "Conseils pour une bonne photo :",
    tipLayFlat: "A plat ou sur cintre",
    tipGoodLighting: "Bien éclairé, sans ombres",
    tipSingleItem: "Vêtement seul, entier",
    tryWithAnotherPhotoBtn: "Essayer avec une autre photo",

    // Garment types
    "garment.pull": "Pull",
    "garment.cardigan": "Cardigan",
    "garment.gilet": "Gilet",
    "garment.autre": "Autre",
    "garment.unknown": "Inconnu",

    // Construction methods
    "construction.en-rond": "En rond",
    "construction.pieces-assemblees": "Pièces assemblées",
    "construction.top-down": "Top-down",
    "construction.bottom-up": "Bottom-up",
    "construction.raglan": "Raglan",
    "construction.side-to-side": "Côté à côté",
    "construction.unknown": "Non identifié",

    // Necklines
    "neckline.ras-du-cou": "Ras du cou",
    "neckline.col-v": "Col V",
    "neckline.col-rond": "Col rond",
    "neckline.col-bateau": "Col bateau",
    "neckline.col-roule": "Col roulé",
    "neckline.capuche": "Capuche",
    "neckline.bateau": "Col bateau",
    "neckline.ouvert-cardigan": "Ouvert (cardigan)",
    "neckline.unknown": "Non identifié",

    // Sleeve types
    "sleeve.montees": "Montées",
    "sleeve.raglan": "Raglan",
    "sleeve.marteau": "Marteau",
    "sleeve.sans-manches": "Sans manches",
    "sleeve.unknown": "Non identifié",

    // Neckband construction
    "neckband.picked-up": "Mailles relevees",
    "neckband.sewn-on": "Col assemble",
    "neckband.integrated": "Col integre",
    "neckband.unknown": "Non identifie",
    "neckband.height.basse": "Basse (~2cm)",
    "neckband.height.moyenne": "Moyenne (~4cm)",
    "neckband.height.haute": "Haute (6cm+)",
    "neckband.height.unknown": "Non identifiee",
    "neckband.stitch.cotes-1x1": "Cotes 1/1",
    "neckband.stitch.cotes-2x2": "Cotes 2/2",
    "neckband.stitch.jersey": "Jersey",
    "neckband.stitch.mousse": "Point mousse",
    "neckband.stitch.autre": "Autre",
    "neckband.stitch.unknown": "Non identifie",
    "neckband.doubled.true": "Col double",
    "neckband.doubled.false": "Col simple",
    neckbandLabel: "Bordure d'encolure",

    // Sleeve lengths
    "sleeve-length.longues": "Longues",
    "sleeve-length.3-4": "3/4",
    "sleeve-length.courtes": "Courtes",
    "sleeve-length.sans": "Sans",
    "sleeve-length.unknown": "Non identifié",

    // Stitch patterns
    "stitch.jersey": "Jersey",
    "stitch.cotes": "Côtes",
    "stitch.mousse": "Point mousse",
    "stitch.torsades": "Torsades",
    "stitch.jacquard": "Jacquard",
    "stitch.dentelle": "Dentelle",
    "stitch.autre": "Autre",
    "stitch.unknown": "Non identifié",

    // Fit styles
    "fit.ajuste": "Ajusté",
    "fit.regular": "Regular",
    "fit.oversized": "Oversized",
    "fit.unknown": "Non identifié",

    // Confidence levels
    "confidence.high": "Confiance élevée",
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
    analysisComplete: "Analyse terminée",
    fillFormToGenerate: "Remplissez le formulaire pour générer votre patron.",
    patternGenerated: "Patron généré avec succès !",
    pdfDownloaded: "PDF téléchargé !",
    pdfShared: "PDF partagé !",
    preparingShare: "Préparation du partage...",
    generatingPDFMessage: "Génération du PDF...",
    mayTakeFewSeconds: "Cela peut prendre quelques secondes.",
    pdfGenerationError: "Erreur lors de la génération du PDF",
    pleaseRetry: "Veuillez réessayer.",
    shareError: "Erreur lors du partage",
    pdfDownloadedInstead: "Le PDF a été téléchargé à la place.",
    complexStitchDetected: "Point complexe détecté",
    limitationsFromAnalysis: "",

    // Footer
    footerMadeWith: "Fait avec amour a Paris",
    footerDisclaimer: "Les patrons sont des estimations - vérifiez toujours vos calculs",

    // Analysis labels
    neckline: "Encolure",
    sleeves: "Manches",
    stitch: "Point",
    fit: "Coupe",
    confidenceLabel: "Confiance",

    // Garment overlay validation
    doesThisMatchYourGarment: "Est-ce que ça correspond à votre vêtement ?",
    yesConfirm: "Oui, continuer",
    noTryAgain: "Non, reessayer",
    whatDoesNotMatch: "Qu'est-ce qui ne correspond pas ?",
    necklineIssue: "L'encolure",
    sleevesIssue: "Les manches",
    shapeIssue: "La forme générale",
    isCardigan: "C'est un cardigan, pas un pull",
    isNotCardigan: "C'est un pull, pas un cardigan",
    back: "Retour",
    validateAnalysis: "Validez l'analyse",
    yourPhoto: "Votre photo",
    whatIUnderstood: "Ce que j'ai compris",
    viewFront: "Devant",
    viewBack: "Dos",
    confidenceHigh: "Confiance élevée",
    confidenceMedium: "Confiance moyenne",
    confidenceLow: "Confiance faible",
    uncertain: "Incertain",

    // Knitting mode
    knittingMode: "Mode tricot",
    launchKnitting: "Lancer le tricot",
    exitKnitting: "Quitter",
    panel: "Panneau",
    row: "Rang",
    previousRow: "Rang précédent",
    nextRow: "Rang suivant",
    markerHere: "Marqueur ici",
    addMarker: "Ajouter un marqueur",
    markerNote: "Note (optionnel)",
    markerAdded: "Marqueur ajouté",
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
    sectionComplete: "Section terminée !",
    goToNext: "Passer a",
    resumeKnitting: "Reprendre où vous en étiez ?",
    resumeAt: "Reprendre au rang",
    startOver: "Recommencer",
    progressLabel: "Progression",
    rowOf: "sur",
    completedLabel: "Terminé",
    markersLabel: "Marqueurs",
    noMarkers: "Aucun marqueur",
    deleteMarker: "Supprimer",
    currentInstruction: "Instruction en cours",
    contextLabel: "Contexte",
    swipeHint: "Swipez pour changer de rang",
    patternNotFound: "Patron non trouvé",
    goBackToPattern: "Retourner au patron",

    // Knit mode
    knitModeTitle: "Mode tricot",
    documentModeTitle: "Patron complet",
    knitModeWelcomeBack: "Bon retour !",
    knitModeContinueFrom: "Continuer au rang {row} ?",
    knitModeContinue: "Continuer",
    knitModeComplete: "terminé",

    // Gauge checker
    gaugeCheckerTitle: "Vérifiez votre échantillon",
    gaugeCheckerDesc: "Comparez votre échantillon tricoté avec le carré de référence",
    gaugeCheckerInstructions: "Posez votre échantillon sur l'écran. Les bords doivent correspondre au carré.",
    swatchSmaller: "Mon echantillon est plus petit",
    swatchLarger: "Mon echantillon est plus grand",
    swatchCorrect: "Ça correspond !",
    gaugeCorrectTitle: "Parfait !",
    gaugeCorrectDesc: "Votre échantillon correspond. Vous pouvez continuer avec ces valeurs.",
    gaugeTighterTitle: "Gauge plus serré",
    gaugeTighterDesc: "Votre gauge est plus serré que prévu. Essayez des aiguilles plus grosses (+0.5mm) ou ajustez vos valeurs.",
    gaugeLooserTitle: "Gauge plus lâche",
    gaugeLooserDesc: "Votre gauge est plus lâche que prévu. Essayez des aiguilles plus fines (-0.5mm) ou ajustez vos valeurs.",
    checkAgain: "Vérifier à nouveau",
    calibrateScreen: "Calibrer l'écran pour plus de précision",
    recalibrateScreen: "Recalibrer l'écran",
    calibrated: "Calibré",
    calibrationInstructions: "Posez une carte bancaire sur le rectangle et ajustez jusqu'a ce que les bords correspondent.",
    calibrationAdjust: "Ajustez avec le curseur ci-dessous",
    creditCard: "Carte bancaire",
    smaller: "Plus petit",
    larger: "Plus grand",
    saveCalibration: "Sauvegarder",
    cancel: "Annuler",
    swatchNote: "L'échantillon doit être lavé et bloqué avant mesure, exactement comme sera le vêtement fini.",
    checkSwatchVisually: "Vérifier mon échantillon visuellement",

    // Yarn calculator
    yarnCalculator: "Calculateur de laine",
    yarnCalculatorDesc: "Combien de laine avez-vous ?",
    dontKnowYetYarn: "Je ne sais pas encore",
    standardEstimate: "Estimation standard basée sur vos mesures",
    haveMyYarn: "J'ai déjà ma laine",
    numberOfSkeins: "Nombre de pelotes",
    metersPerSkein: "Metrage par pelote (m)",
    total: "au total",
    estimatedYarnNeeded: "Besoin estimé",
    yarnNeeded: "Laine nécessaire",
    yourYarnStock: "Votre stock",
    yarnSufficient: "Vous avez assez de laine !",
    yarnSufficientFull: "Vous avez assez de laine ! (Besoin estime : {0}m)",
    yarnTight: "C'est un peu juste",
    yarnTightFull: "C'est un peu juste. Prévoyez peut-être une pelote de plus pour être tranquille.",
    yarnInsufficient: "Il vous manque environ {0}m",
    yarnInsufficientFull: "Il va vous manquer environ {0}m.",
    suggestionsToAdjust: "Suggestions pour ajuster :",
    adjustBodyLength: "Raccourcir le corps de {0}cm (-{1}m)",
    adjustSleeveLength: "Raccourcir les manches de {0}cm (-{1}m)",
    adjustEase: "Reduire l'aisance de {0}cm (-{1}m)",
    applyAdjustments: "Appliquer les ajustements sélectionnés",
    adjustmentsApplied: "Ajustements appliqués !",
    patternAdjustedForYarn: "Patron ajusté pour votre stock de laine",
    yarnEstimateDisclaimer: "Le métrage est une estimation. Chaque tricoteur·se a une tension différente. En cas de doute, prenez toujours une pelote de plus !",

    // Size presets
    chooseYourSize: "Votre taille",
    chooseABase: "Choisir une base",
    startFromStandardSize: "Sélectionnez votre taille pour commencer",
    customizeMeasurements: "Personnaliser les mensurations",
    hideDetails: "Masquer les détails",
    customMeasurements: "Mesures personnalisees",
    basedOnSize: "Base taille",
    modified: "(personnalisé)",
    standardValue: "Valeur standard",
    youEntered: "Vous avez saisi",
    noNeedForPrecision: "Pas besoin de précision au millimètre ! Des valeurs approximatives suffisent.",
    hipCircumference: "Tour de hanches",
    detailedMeasurements: "Mensurations détaillées",

    // Image uploader
    dropImageHere: "Deposez vos images ici",
    dragPhotoHere: "Glissez vos photos ici",
    tapToUpload: "Appuyez pour uploader votre photo",
    or: "ou",
    browseFiles: "Parcourir les fichiers",
    maxSize: "JPG, PNG ou WebP - Max 10 Mo par image",
    changeImageBtn: "Modifier",
    analyzeThisImage: "Analyser",
    analyzingBtn: "Analyse...",
    dropZoneLabel: "Zone de dépôt d'images. Cliquez ou déposez une ou plusieurs images.",
    photoTipsTitle: "Conseils pour une bonne photo :",
    photoTipFront: "De face, bien éclairé",
    multiPhotoTip: "N'hésitez pas à ajouter plusieurs photos ou angles du modèle pour nous aider à mieux le comprendre.",
    multiPhotoTip2: "Un modèle à plat, sur un cintre, ou avec les détails visibles nous permet de faire un travail encore plus pertinent.",
    addMorePhotos: "Ajouter des photos",
    photosSelected: "{count} photo(s) sélectionnée(s)",
    removePhoto: "Supprimer cette photo",
    photoTipHanger: "Sur cintre ou a plat",
    photoTipAlone: "Vêtement seul",
    retryWithAnotherPhoto: "Réessayer avec une autre photo",
    imageUploadSuccess: "Image chargée avec succès",
    imageUploadError: "Erreur lors du chargement de l'image",

    // Auto-save
    saving: "Sauvegarde...",
    saved: "Sauvegardé",
    projectInProgress: "Projet en cours",
    resumeProjectQuestion: "Vous avez un projet en cours. Voulez-vous le reprendre ?",
    resumeProject: "Reprendre",
    newProject: "Nouveau projet",

    // Home page steps
    step: "Étape",
    step1Title: "Uploadez votre inspiration",
    step1Desc: "Une photo de face du vêtement, bien éclairée",
    step2Title: "La Maille lit le tricot",
    step2Desc: "Identification de la forme, des proportions et des points",
    step3Title: "Entrez vos mesures",
    step3Desc: "Tour de poitrine, longueur, et votre gauge",
    step4Title: "Recevez votre patron adapté",
    step4Desc: "Instructions rang par rang, adaptées à vous",

    // Capabilities
    whatICanDo: "Ce que je sais faire",
    myLimits: "Bientôt disponible",
    basicSweaters: "Pulls et cardigans basiques",
    basicStitches: "Jersey, côtes, point mousse",
    adaptedCalcs: "Calculs adaptés à VOTRE échantillon",
    cablesLimit: "Reproduction de grilles de torsades",
    colorworkLimit: "Motifs jacquard",
    laceLimit: "Dentelle complexe",
    experimentalLimit: "Constructions experimentales",

    // SEO pages CTAs
    "seo.tryFree": "Essayer gratuitement",
    "seo.uploadPhoto": "Uploader une photo",
    "seo.getStarted": "Commencer",
    "seo.learnHow": "Comment ça marche",

    // Privacy & Terms
    "privacy.title": "Politique de confidentialite",
    "privacy.lastUpdated": "Derniere mise a jour",
    "terms.title": "Conditions d'utilisation",
    "terms.lastUpdated": "Derniere mise a jour",

    // Saved patterns
    "savedPatterns.title": "Mes patrons",
    "savedPatterns.empty": "Vous n'avez pas encore de patron sauvegarde",
    "savedPatterns.emptyDescription": "Generez un patron et sauvegardez-le pour le retrouver ici",
    "savedPatterns.generateFirst": "Generer mon premier patron",
    "savedPatterns.save": "Sauvegarder",
    "savedPatterns.saving": "Sauvegarde...",
    "savedPatterns.saved": "Patron sauvegarde !",
    "savedPatterns.saveError": "Erreur lors de la sauvegarde",
    "savedPatterns.alreadySaved": "Ce patron est deja sauvegarde",
    "savedPatterns.delete": "Supprimer",
    "savedPatterns.deleting": "Suppression...",
    "savedPatterns.deleted": "Patron supprime",
    "savedPatterns.deleteError": "Erreur lors de la suppression",
    "savedPatterns.deleteConfirm": "Supprimer ce patron ?",
    "savedPatterns.deleteConfirmDescription": "Cette action est irreversible.",
    "savedPatterns.view": "Voir le patron",
    "savedPatterns.loading": "Chargement...",
    "savedPatterns.loadError": "Erreur lors du chargement",
    "savedPatterns.loginRequired": "Connectez-vous pour sauvegarder vos patrons",
    "savedPatterns.createdAt": "Cree le",
    "savedPatterns.patternCount": "{count} patron(s)",

    // Page patron publique (BRIEF-03)
    "publicToggle.label": "Rendre public",
    "publicToggle.confirmTitle": "Rendre ce patron public ?",
    "publicToggle.confirmDescription":
      "La page du patron sera visible par tous et indexée par Google. Votre photo source n'est jamais publiée et votre nom n'apparaît pas sur la page.",
    "publicToggle.confirm": "Rendre public",
    "publicToggle.published": "Patron publié",
    "publicToggle.unpublished": "Patron repassé en privé",
    "publicToggle.error": "Impossible de modifier la visibilité",
    "publicToggle.unavailable": "Publication indisponible pour le moment",
    "publicToggle.copyLink": "Copier le lien",
    "publicToggle.copied": "Lien copié",
    "publicToggle.viewPage": "Voir la page",

    // Nudge "rendre public" juste apres la sauvegarde (aout 2026 : 0 patron public sur 37)
    "saveNudge.title": "Partager ce patron ?",
    "saveNudge.text":
      "Rendez-le public : il aura sa propre page, visible par tous et indexée par Google. Votre photo source n'est jamais publiée et votre nom n'apparaît pas.",
    "saveNudge.button": "Rendre public",
    "saveNudge.later": "Plus tard",
    "saveNudge.done": "Patron publié. Retrouvez le lien dans Mes patrons.",

    // FAQ home (GEO : reponses directes pour Google et les assistants IA)
    "homeFaqTitle": "Questions fréquentes",
    "homeFaq.q1": "Comment fonctionne le générateur de patron de tricot ?",
    "homeFaq.a1":
      "Vous importez la photo d'un pull, d'un cardigan ou d'un gilet. L'IA identifie la construction (top-down, bottom-up, raglan, manches montées), l'encolure, le type de manches et le point principal, puis calcule un patron complet rang par rang à partir de votre échantillon et de vos mesures.",
    "homeFaq.q2": "Est-ce que La Maille est gratuit ?",
    "homeFaq.a2":
      "Oui. L'analyse de photo et la génération du patron sont gratuites et ne nécessitent pas de compte. Un compte gratuit permet de sauvegarder vos patrons.",
    "homeFaq.q3": "Quelle différence avec un générateur de grille ou de diagramme ?",
    "homeFaq.a3":
      "La plupart des outils en ligne transforment une image en grille de couleurs (jacquard). La Maille produit un vrai patron de vêtement : montage, augmentations, diminutions, encolure, manches et rabattage, adaptés à votre taille.",
    "homeFaq.q4": "Quels vêtements sont pris en charge ?",
    "homeFaq.a4":
      "Les pulls, cardigans, gilets et tops sans manches en jersey, côtes ou point mousse. Les torsades complexes, la dentelle et le jacquard ne sont pas encore générés.",
    "homeFaq.q5": "Faut-il connaître son échantillon ?",
    "homeFaq.a5":
      "Oui. Le patron est calculé à partir de votre nombre de mailles et de rangs pour 10 cm avec votre laine et vos aiguilles. Tricotez toujours un échantillon avant de commencer.",

    // Authentication
    "auth.signIn": "Se connecter",
    "auth.signUp": "S'inscrire",
    "auth.signOut": "Se déconnecter",
    "auth.signInDescription": "Connectez-vous pour accéder à votre patron",
    "auth.signUpDescription": "Créez un compte pour sauvegarder vos patrons",
    "auth.continueWithGoogle": "Continuer avec Google",
    "auth.or": "ou",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.username": "Pseudo",
    "auth.usernamePlaceholder": "votre_pseudo",
    "auth.usernameHelp": "Lettres, chiffres, tirets et underscores uniquement",
    "auth.usernameExists": "Ce pseudo est déjà pris",
    "auth.signInButton": "Se connecter",
    "auth.signUpButton": "Créer un compte",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.createAccount": "Créer un compte",
    "auth.hasAccount": "Déjà un compte ?",
    "auth.signInLink": "Se connecter",
    "auth.signUpSuccess": "Compte créé ! Bienvenue sur La Maille",
    "auth.signInSuccess": "Connexion réussie !",
    "auth.signOutSuccess": "Déconnexion réussie",
    "auth.signOutError": "Erreur lors de la déconnexion",
    "auth.signOutTitle": "Se déconnecter ?",
    "auth.signOutConfirm": "Êtes-vous sûr de vouloir vous déconnecter ?",
    "auth.unknownError": "Une erreur est survenue",
    "auth.signUpToSeePattern": "Créez un compte pour voir votre patron",

    // Pattern instructions
    "pattern.stitchesFor": "Mailles pour {0} cm",
    "pattern.rowsFor": "Rangs pour {0} cm",
    "pattern.roundedFrom": "Arrondi de {0} à {1}",
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
    "pattern.castOnCircular": "Monter {0} mailles sur aiguilles circulaires. Joindre en rond en veillant à ne pas vriller. Placer un marqueur pour le début du tour. Tricoter {1} tours en côtes 2/2 (2 end, 2 env).",
    "pattern.circumferenceNote": "Circonférence totale : {0} cm. Utilisez des aiguilles circulaires de 80 cm minimum.",
    "pattern.continueStockinette": "Continuer en jersey endroit (tricoter toutes les mailles à l'endroit) pendant {0} tours.",
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
    "pattern.dpnNote": "Utiliser des aiguilles double-pointes ou magic loop pour les petites circonférences.",
    "pattern.sleeveDecrease": "Diminutions : {0}. On obtient {1} m.",
    "pattern.decreaseNote": "Diminuer avec SSK avant le marqueur et K2tog après.",
    "pattern.continueStockinetteFor": "Continuer en jersey pendant {0} rangs.",
    "pattern.cuffRib": "Poignet : tricoter {0} tours en côtes 2/2 sur les {1} m. Rabattre souplement en côtes.",
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
    "pattern.seamlessNote4": "Bloquer le vêtement terminé aux dimensions.",
    "pattern.flatNote1": "Bloquer toutes les pieces aux dimensions.",
    "pattern.flatNote2": "Coudre les epaules (couture invisible ou grafting).",
    "pattern.flatNote3Sleeves": "Monter les manches en alignant le centre de la tete de manche avec la couture d'epaule.",
    "pattern.flatNote4Sleeves": "Coudre les cotes du corps et les dessous de manches en une seule couture.",
    "pattern.flatNote3NoSleeves": "Coudre les cotes du corps.",
    "pattern.flatNote5": "Relever les mailles de l'encolure et tricoter la bordure.",
    "pattern.neckbandAssembly": "Tricoter la bordure d'encolure selon les instructions de la pièce 'Bordure d'encolure'.",
    "pattern.neckbandAssemblyCardigan": "Tricoter la bordure d'encolure et les bandes de boutonnage.",

    // Finishing
    "pattern.weavEnds": "Rentrer tous les fils soigneusement.",
    "pattern.blockGarment": "Bloquer le vêtement fini à l'eau tiède.",
    "pattern.sewButtons": "Coudre {0} boutons en face des boutonnières.",
    "pattern.sewZipper": "Coudre la fermeture éclair sur les bandes de devant.",

    // Disclaimer
    "pattern.constructionSeamless": "Ce patron utilise une construction en rond pour minimiser les coutures.",
    "pattern.constructionFlat": "Ce patron utilise des pièces à plat à assembler.",
    "pattern.disclaimerIntro": "Ce patron a été généré automatiquement par La Maille à partir d'une analyse d'image.",
    "pattern.disclaimerWork": "Il constitue une base de travail et peut nécessiter des ajustements selon :",
    "pattern.disclaimerSwatch": "Votre échantillon réel (TOUJOURS faire un échantillon !)",
    "pattern.disclaimerYarn": "La souplesse ou rigidité de votre fil",
    "pattern.disclaimerFit": "Vos préférences de coupe",
    "pattern.disclaimerConfidence": "Confiance de l'analyse : {0}",
    "pattern.disclaimerLimitations": "Limitations identifiées : {0}",
    "pattern.disclaimerAdvice": "En cas de doute, consultez un patron commercial similaire pour comparaison.",

    // Simplified funnel
    pickYourSize: "Choisissez votre taille",
    // PatternSection (libellés de pièce)
    pieceCastOn: "Monter",
    pieceStitches: "mailles",
    pieceKnit: "Tricoter",
    pieceTotalRows: "rangs au total",
    pieceSchematic: "Schéma",
    pieceHide: "Masquer",
    pieceShow: "Afficher",
    pieceRow: "Rang",
    pieceRows: "Rangs",
    pieceSeeCalculations: "Voir les calculs",
    pieceResult: "Résultat :",
    toastPatternGenerated: "Patron généré avec succès !",
    toastAnalysisDone: "Analyse terminée",
    toastAnalysisDoneDesc: "Choisissez une taille pour générer votre patron.",
    oneClickPattern: "Un clic, un patron",
    orCustomize: "ou personnalisez les mesures",
    customizePattern: "Affiner mon patron",
    regeneratePattern: "Régénérer le patron",
    "step.photo": "Photo",
    "step.size": "Taille",
    "step.pattern": "Patron",

    // Home — See it in action
    homeDemoTitle: "Voir en action",
    homeDemoYourPhoto: "Votre photo",
    homeDemoUploadCta: "Importez n'importe quelle photo de pull",
    homeDemoUploadHint: "Vue de face, bien éclairée",
    homeDemoYourPattern: "Votre patron",
    homeDemoPatternHeader: "La Maille — Patron personnalisé",
    homeDemoCastOn: "Monter",
    homeDemoCastOnRest: " 84 mailles sur aiguilles circulaires.",
    homeDemoRows120: "Rangs 1-20 :",
    homeDemoRows120Rest: " côtes *2 end., 2 env.*",
    homeDemoRow21: "Rang 21 :",
    homeDemoRow21Rest: " toutes les mailles à l'endroit (jersey)",
    homeDemoContinue: "Continuer",
    homeDemoContinueRest: " en jersey sur 38 cm",
    homeDemoArmhole: "↓ Façonnage des emmanchures",
    homeDemoNextRow: "Rang suivant :",
    homeDemoNextRowRest: " rabattre 4 m., tricoter jusqu'à la fin",
    homeDemoDecRow: "Rang dim. :",
    homeDemoDecRowRest: " 1 end., surj. simple, end. jusqu'aux 3 dernières m., 2 ens. end., 1 end.",
    homeDemoAdapted: "Adapté à votre échantillon et vos mesures",
    homeDemoMobileCaption: "📸 → 🧶 De la photo au patron",

    // Home — From the Blog
    homeBlogTitle: "Sur le blog",
    homeBlogSubtitle: "Conseils et guides pour tricoter en toute confiance.",
    homeBlogViewAll: "Voir tous les articles →",
    homeBlogArticle1: "Recréer n'importe quel pull à partir d'une photo",
    homeBlogArticle2: "Comprendre l'échantillon : le guide complet",
    homeBlogArticle3: "Top-down vs bottom-up : avantages et inconvénients",
    homeBlogArticle4: "Initiation au jacquard",

    // Uploader steps
    uploadStepUpload: "📤 Importer",
    uploadStepMeasure: "📏 Mesurer",
    uploadStepPattern: "🧶 Patron en ~2 min",

    // Social proof
    socialProofPrefix: "🧶 Rejoignez ",
    socialProofKnitters: "1 000+ tricoteurs",
    socialProofMiddle: " qui utilisent La Maille — ",
    socialProofFree: "c'est gratuit",
  },

  en: {
    // Header
    siteName: "LA MAILLE",
    tagline: "From photo to pattern",

    // Home page
    homeTitle: "Turn any sweater into YOUR pattern",
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
    rateLimitAnonymous:
      "You've reached today's limit of {0} free analyses. Create a free account to get {1} analyses per day.",
    rateLimitAuthenticated:
      "You've reached your daily limit of {0} analyses. Come back tomorrow to continue.",

    // Form
    gauge: "Gauge",
    whyEssential: "Why is this essential?",
    gaugeExplanation:
      "The gauge determines all dimensions. Without it, the pattern will be wrong.",
    whyEssentialTitle: "Why gauge is essential",
    whyEssentialText1: "Gauge is the key to successful knitting. It determines all the dimensions of your garment.",
    whyEssentialText2: "Every knitter has different tension, and every yarn behaves differently. Without a gauge swatch, the pattern will be approximate.",
    whyEssentialText3: "Take the time to knit a 15x15 cm square, wash it and block it as you will for the finished garment.",
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
    printPattern: "Print",
    download: "Download",
    restart: "Start over",
    reportProblem: "Report a problem",
    generatingPDF: "Generating...",
    loading: "Loading...",

    // Email gate (PDF export / print, BRIEF-01)
    emailGateTitle: "One email to unlock your pattern",
    emailGateDescription:
      "Your pattern stays fully readable on screen for free. Exporting to PDF or printing just needs your email.",
    emailGateEmailLabel: "Email",
    emailGateEmailPlaceholder: "you@example.com",
    emailGateNewsletterLabel: "Get knitting tips and news",
    emailGateSubmit: "Unlock",
    emailGateSubmitting: "Unlocking...",
    emailGateInvalidEmail: "Please enter a valid email address.",

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

    // Neckband construction
    "neckband.picked-up": "Picked up",
    "neckband.sewn-on": "Sewn on",
    "neckband.integrated": "Integrated",
    "neckband.unknown": "Unknown",
    "neckband.height.basse": "Low (~2cm)",
    "neckband.height.moyenne": "Medium (~4cm)",
    "neckband.height.haute": "High (6cm+)",
    "neckband.height.unknown": "Unknown",
    "neckband.stitch.cotes-1x1": "1x1 Rib",
    "neckband.stitch.cotes-2x2": "2x2 Rib",
    "neckband.stitch.jersey": "Stockinette",
    "neckband.stitch.mousse": "Garter stitch",
    "neckband.stitch.autre": "Other",
    "neckband.stitch.unknown": "Unknown",
    "neckband.doubled.true": "Doubled collar",
    "neckband.doubled.false": "Single collar",
    neckbandLabel: "Neckband",

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
    viewFront: "Front",
    viewBack: "Back",
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
    chooseYourSize: "Your size",
    chooseABase: "Choose a base",
    startFromStandardSize: "Select your size to get started",
    customizeMeasurements: "Customize measurements",
    hideDetails: "Hide details",
    customMeasurements: "Custom measurements",
    basedOnSize: "Based on size",
    modified: "(customized)",
    standardValue: "Standard value",
    youEntered: "You entered",
    noNeedForPrecision: "No need for millimeter precision! Approximate values are fine.",
    hipCircumference: "Hip circumference",
    detailedMeasurements: "Detailed measurements",

    // Image uploader
    dropImageHere: "Drop your images here",
    dragPhotoHere: "Drag your photos here",
    tapToUpload: "Tap to upload your photo",
    or: "or",
    browseFiles: "Browse files",
    maxSize: "JPG, PNG or WebP - Max 10 MB per image",
    changeImageBtn: "Change",
    analyzeThisImage: "Analyze",
    analyzingBtn: "Analyzing...",
    dropZoneLabel: "Image drop zone. Click or drop one or more images.",
    photoTipsTitle: "Tips for a good photo:",
    photoTipFront: "Front view, well-lit",
    photoTipHanger: "On hanger or flat",
    photoTipAlone: "Garment alone",
    multiPhotoTip: "Feel free to add multiple photos or angles of the garment to help us understand it better.",
    multiPhotoTip2: "A garment laid flat, on a hanger, or with visible details helps us do a better job.",
    addMorePhotos: "Add more photos",
    photosSelected: "{count} photo(s) selected",
    removePhoto: "Remove this photo",
    retryWithAnotherPhoto: "Try with another photo",
    imageUploadSuccess: "Image loaded successfully",
    imageUploadError: "Error loading image",

    // Auto-save
    saving: "Saving...",
    saved: "Saved",
    projectInProgress: "Project in progress",
    resumeProjectQuestion: "You have a project in progress. Do you want to resume it?",
    resumeProject: "Continue",
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
    myLimits: "Coming soon",
    basicSweaters: "Basic sweaters and cardigans",
    basicStitches: "Stockinette, ribbing, garter stitch",
    adaptedCalcs: "Calculations adapted to YOUR gauge",
    cablesLimit: "Cable chart reproduction",
    colorworkLimit: "Colorwork designs",
    laceLimit: "Complex lace",
    experimentalLimit: "Experimental constructions",

    // SEO pages CTAs
    "seo.tryFree": "Try it free",
    "seo.uploadPhoto": "Upload a photo",
    "seo.getStarted": "Get started",
    "seo.learnHow": "How it works",

    // Privacy & Terms
    "privacy.title": "Privacy Policy",
    "privacy.lastUpdated": "Last updated",
    "terms.title": "Terms of Service",
    "terms.lastUpdated": "Last updated",

    // Saved patterns
    "savedPatterns.title": "My patterns",
    "savedPatterns.empty": "You don't have any saved patterns yet",
    "savedPatterns.emptyDescription": "Generate a pattern and save it to find it here",
    "savedPatterns.generateFirst": "Generate my first pattern",
    "savedPatterns.save": "Save",
    "savedPatterns.saving": "Saving...",
    "savedPatterns.saved": "Pattern saved!",
    "savedPatterns.saveError": "Error saving pattern",
    "savedPatterns.alreadySaved": "This pattern is already saved",
    "savedPatterns.delete": "Delete",
    "savedPatterns.deleting": "Deleting...",
    "savedPatterns.deleted": "Pattern deleted",
    "savedPatterns.deleteError": "Error deleting pattern",
    "savedPatterns.deleteConfirm": "Delete this pattern?",
    "savedPatterns.deleteConfirmDescription": "This action cannot be undone.",
    "savedPatterns.view": "View pattern",
    "savedPatterns.loading": "Loading...",
    "savedPatterns.loadError": "Error loading patterns",
    "savedPatterns.loginRequired": "Sign in to save your patterns",
    "savedPatterns.createdAt": "Created on",
    "savedPatterns.patternCount": "{count} pattern(s)",

    // Public pattern page (BRIEF-03)
    "publicToggle.label": "Make public",
    "publicToggle.confirmTitle": "Make this pattern public?",
    "publicToggle.confirmDescription":
      "The pattern page will be visible to everyone and indexed by Google. Your source photo is never published and your name does not appear on the page.",
    "publicToggle.confirm": "Make public",
    "publicToggle.published": "Pattern published",
    "publicToggle.unpublished": "Pattern set back to private",
    "publicToggle.error": "Could not update visibility",
    "publicToggle.unavailable": "Publishing is unavailable right now",
    "publicToggle.copyLink": "Copy link",
    "publicToggle.copied": "Link copied",
    "publicToggle.viewPage": "View page",

    // Nudge "make public" right after saving (Aug 2026: 0 public patterns out of 37)
    "saveNudge.title": "Share this pattern?",
    "saveNudge.text":
      "Make it public: it gets its own page, visible to everyone and indexed by Google. Your source photo is never published and your name does not appear.",
    "saveNudge.button": "Make public",
    "saveNudge.later": "Later",
    "saveNudge.done": "Pattern published. Find the link in My patterns.",

    // Home FAQ (GEO: direct answers for Google and AI assistants)
    "homeFaqTitle": "Frequently asked questions",
    "homeFaq.q1": "How does the knitting pattern generator work?",
    "homeFaq.a1":
      "You upload a photo of a sweater, cardigan or vest. The AI identifies the construction (top-down, bottom-up, raglan, set-in sleeves), the neckline, the sleeve style and the main stitch, then calculates a complete row-by-row pattern from your gauge and measurements.",
    "homeFaq.q2": "Is La Maille free?",
    "homeFaq.a2":
      "Yes. Photo analysis and pattern generation are free and do not require an account. A free account lets you save your patterns.",
    "homeFaq.q3": "How is it different from a chart or grid generator?",
    "homeFaq.a3":
      "Most online tools turn an image into a color grid for colorwork. La Maille produces an actual garment pattern: cast on, increases, decreases, neckline, sleeves and bind off, sized to your measurements.",
    "homeFaq.q4": "Which garments are supported?",
    "homeFaq.a4":
      "Pullovers, cardigans, vests and sleeveless tops in stockinette, ribbing or garter stitch. Complex cables, lace and colorwork are not generated yet.",
    "homeFaq.q5": "Do I need to know my gauge?",
    "homeFaq.a5":
      "Yes. The pattern is calculated from your stitches and rows per 10 cm (4 inches) with your yarn and needles. Always knit a swatch before starting.",

    // Authentication
    "auth.signIn": "Sign in",
    "auth.signUp": "Sign up",
    "auth.signOut": "Sign out",
    "auth.signInDescription": "Sign in to access your pattern",
    "auth.signUpDescription": "Create an account to save your patterns",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.or": "or",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.usernamePlaceholder": "your_username",
    "auth.usernameHelp": "Letters, numbers, dashes and underscores only",
    "auth.usernameExists": "This username is already taken",
    "auth.signInButton": "Sign in",
    "auth.signUpButton": "Create account",
    "auth.noAccount": "Don't have an account?",
    "auth.createAccount": "Create one",
    "auth.hasAccount": "Already have an account?",
    "auth.signInLink": "Sign in",
    "auth.signUpSuccess": "Account created! Welcome to La Maille",
    "auth.signInSuccess": "Successfully signed in!",
    "auth.signOutSuccess": "Successfully signed out",
    "auth.signOutError": "Error signing out",
    "auth.signOutTitle": "Sign out?",
    "auth.signOutConfirm": "Are you sure you want to sign out?",
    "auth.unknownError": "An error occurred",
    "auth.signUpToSeePattern": "Create an account to see your pattern",

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
    "pattern.neckbandAssembly": "Work the neckband following the instructions in the 'Neckband' piece.",
    "pattern.neckbandAssemblyCardigan": "Work the neckband and button bands.",

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

    // Simplified funnel
    pickYourSize: "Pick your size",
    // PatternSection (piece labels)
    pieceCastOn: "Cast on",
    pieceStitches: "stitches",
    pieceKnit: "Knit",
    pieceTotalRows: "rows total",
    pieceSchematic: "Schematic",
    pieceHide: "Hide",
    pieceShow: "Show",
    pieceRow: "Row",
    pieceRows: "Rows",
    pieceSeeCalculations: "See calculations",
    pieceResult: "Result:",
    toastPatternGenerated: "Pattern generated!",
    toastAnalysisDone: "Analysis complete",
    toastAnalysisDoneDesc: "Pick a size to generate your pattern.",
    oneClickPattern: "One click, one pattern",
    orCustomize: "or customize measurements",
    customizePattern: "Refine my pattern",
    regeneratePattern: "Regenerate pattern",
    "step.photo": "Photo",
    "step.size": "Size",
    "step.pattern": "Pattern",

    // Home — See it in action
    homeDemoTitle: "See it in action",
    homeDemoYourPhoto: "Your photo",
    homeDemoUploadCta: "Upload any sweater photo",
    homeDemoUploadHint: "Front view, well-lit",
    homeDemoYourPattern: "Your pattern",
    homeDemoPatternHeader: "La Maille — Custom Pattern",
    homeDemoCastOn: "Cast on",
    homeDemoCastOnRest: " 84 stitches on circular needles.",
    homeDemoRows120: "Rows 1-20:",
    homeDemoRows120Rest: " *K2, P2* ribbing",
    homeDemoRow21: "Row 21:",
    homeDemoRow21Rest: " Knit all stitches (stockinette)",
    homeDemoContinue: "Continue",
    homeDemoContinueRest: " in stockinette for 38 cm",
    homeDemoArmhole: "↓ Armhole shaping",
    homeDemoNextRow: "Next row:",
    homeDemoNextRowRest: " Bind off 4 sts, knit to end",
    homeDemoDecRow: "Dec row:",
    homeDemoDecRowRest: " K1, SSK, knit to last 3 sts, K2tog, K1",
    homeDemoAdapted: "Adapted to your gauge & measurements",
    homeDemoMobileCaption: "📸 → 🧶 From photo to pattern",

    // Home — From the Blog
    homeBlogTitle: "From the Blog",
    homeBlogSubtitle: "Tips and guides to help you knit with confidence.",
    homeBlogViewAll: "View all articles →",
    homeBlogArticle1: "How to Recreate Any Sweater From a Photo",
    homeBlogArticle2: "Understanding Knitting Gauge: The Complete Guide",
    homeBlogArticle3: "Top-Down vs Bottom-Up Sweaters: Pros and Cons",
    homeBlogArticle4: "Colorwork Knitting for Beginners",

    // Uploader steps
    uploadStepUpload: "📤 Upload",
    uploadStepMeasure: "📏 Measure",
    uploadStepPattern: "🧶 Pattern in ~2 min",

    // Social proof
    socialProofPrefix: "🧶 Join ",
    socialProofKnitters: "1,000+ knitters",
    socialProofMiddle: " who use La Maille — ",
    socialProofFree: "it's free",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["fr"];

/**
 * Locale de la requete, fournie par <I18nProvider> (components/I18nSsrInit.tsx)
 * pendant le rendu serveur. Necessaire parce que zustand 5 sert
 * `getInitialState()` comme snapshot serveur : un `useI18n.setState` cote
 * serveur n'est jamais vu par les composants rendus en SSR, et /fr sortait en
 * anglais dans le HTML brut (constate en prod le 2026-08-21).
 */
export const SsrLanguageContext = createContext<Language | null>(null);

export function useTranslation() {
  const { language: storeLanguage, setLanguage } = useI18n();
  const ssrLanguage = useContext(SsrLanguageContext);
  // Serveur : la locale de la requete fait foi. Client : le store (reactif au
  // selecteur de langue), dont la valeur initiale est deduite de l'URL / du
  // cookie, donc identique au serveur : pas de mismatch d'hydratation.
  const language =
    typeof window === "undefined" && ssrLanguage ? ssrLanguage : storeLanguage;

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
