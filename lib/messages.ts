/**
 * Messages contextuels pour l'UX de La Maille
 */

// Messages de rejet selon le type d'erreur
export const REJECTION_MESSAGES: Record<string, string> = {
  "not-knit":
    "Je ne détecte pas de tricot sur cette image. La Maille analyse uniquement les vêtements tricotés.",
  "too-blurry":
    "L'image est trop floue. Essayez avec une photo plus nette, bien éclairée.",
  "multiple-items":
    "Je vois plusieurs vêtements. Uploadez une photo avec un seul article.",
  "not-garment": "Je ne reconnais pas de vêtement sur cette image.",
  "too-complex":
    "La construction semble très complexe. Je ne peux pas générer un patron fiable.",
  "not-supported":
    "Ce type de vêtement n'est pas encore supporté. La Maille gère les pulls et cardigans.",
  "poor-angle":
    "La photo n'est pas prise de face. Essayez avec une vue frontale du vêtement.",
  default:
    "Je n'ai pas pu analyser cette image. Essayez avec une autre photo.",
};

// Labels de confiance avec couleurs
export const CONFIDENCE_DISPLAY: Record<
  string,
  { label: string; color: "success" | "warning" | "destructive"; icon: string }
> = {
  high: {
    label: "Analyse fiable",
    color: "success",
    icon: "✓",
  },
  medium: {
    label: "Analyse partielle",
    color: "warning",
    icon: "~",
  },
  low: {
    label: "Analyse incertaine",
    color: "warning",
    icon: "?",
  },
  insufficient: {
    label: "Analyse insuffisante",
    color: "destructive",
    icon: "!",
  },
};

// Avertissements pour les types de points
export const STITCH_WARNINGS: Record<string, string> = {
  torsades:
    "Les torsades nécessitent un diagramme dédié. Le patron indiquera l'emplacement mais pas le motif exact.",
  jacquard:
    "Le motif coloré ne peut pas être reproduit automatiquement. Le patron sera pour une version unie.",
  dentelle:
    "La dentelle est trop complexe pour être générée automatiquement. Utilisez un patron dédié.",
  intarsia:
    "L'intarsia nécessite un diagramme séparé. Le patron inclura les formes de base.",
  brioche:
    "Le point brioche demande des instructions spécifiques. Le patron utilisera les côtes comme base.",
};

// Messages de chargement avec progression
export const LOADING_MESSAGES = {
  analyzing: [
    "Analyse en cours...",
    "Claude examine votre image...",
    "Identification de la construction...",
    "Détection des détails...",
  ],
  generating: [
    "Génération du patron...",
    "Calcul des mesures...",
    "Création des instructions...",
  ],
  // Messages encourageants après un délai
  encouragement: [
    "Ça arrive...",
    "Encore un instant...",
    "Presque fini...",
    "Merci de votre patience...",
  ],
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  patternGenerated: "Patron généré avec succès !",
  pdfExported: "PDF prêt à télécharger",
  imageSaved: "Image enregistrée",
};

// Messages d'erreur génériques
export const ERROR_MESSAGES = {
  networkError: "Problème de connexion. Vérifiez votre internet et réessayez.",
  serverError: "Erreur serveur. Réessayez dans quelques instants.",
  imageTooBig: "Image trop volumineuse. Maximum 10 Mo.",
  invalidFormat: "Format non supporté. Utilisez JPG, PNG ou WebP.",
  analysisTimeout: "L'analyse a pris trop de temps. Réessayez avec une image plus simple.",
  generic: "Une erreur s'est produite. Veuillez réessayer.",
};

// Helper pour obtenir le message de rejet approprié
export function getRejectionMessage(reason?: string): string {
  if (!reason) return REJECTION_MESSAGES.default;

  // Chercher une correspondance dans les clés
  const lowerReason = reason.toLowerCase();
  for (const [key, message] of Object.entries(REJECTION_MESSAGES)) {
    if (lowerReason.includes(key.replace("-", " ")) || lowerReason.includes(key)) {
      return message;
    }
  }

  // Si le reason est déjà un message lisible, le retourner
  if (reason.length > 20) {
    return reason;
  }

  return REJECTION_MESSAGES.default;
}

// Helper pour obtenir l'avertissement de point
export function getStitchWarning(pattern: string): string | null {
  const lowerPattern = pattern.toLowerCase();
  for (const [key, warning] of Object.entries(STITCH_WARNINGS)) {
    if (lowerPattern.includes(key)) {
      return warning;
    }
  }
  return null;
}

// Helper pour le message de chargement rotatif
export function getLoadingMessage(
  type: "analyzing" | "generating",
  elapsedSeconds: number
): string {
  const messages = LOADING_MESSAGES[type];

  // Après 8 secondes, ajouter des messages d'encouragement
  if (elapsedSeconds > 8) {
    const encourageIndex = Math.floor((elapsedSeconds - 8) / 3) % LOADING_MESSAGES.encouragement.length;
    return LOADING_MESSAGES.encouragement[encourageIndex];
  }

  // Rotation des messages principaux toutes les 2 secondes
  const index = Math.floor(elapsedSeconds / 2) % messages.length;
  return messages[index];
}
