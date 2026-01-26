import { StyleSheet } from "@react-pdf/renderer";

// Couleurs
export const colors = {
  background: "#F9F7F2",
  foreground: "#2D2A26",
  primary: "#C4785B", // Terra Cotta
  secondary: "#8B9E8B", // Vert Sauge
  muted: "#6B6560",
  border: "#E0DAD0",
  accent: "#C0573E",
  white: "#FFFFFF",
};

// Styles globaux
export const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    padding: 40,
    fontSize: 10,
    color: colors.foreground,
  },

  // Titres
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.foreground,
  },
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
    color: colors.foreground,
  },
  h3: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    color: colors.muted,
  },

  // Corps de texte
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.foreground,
  },
  bodySmall: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.muted,
  },

  // Technique / Calculs
  mono: {
    fontFamily: "Courier",
    fontSize: 10,
    backgroundColor: "#F0EDE8",
    padding: 4,
    borderRadius: 2,
  },

  // Badges
  badge: {
    backgroundColor: colors.primary,
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 9,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 9,
  },

  // Cartes
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },

  // Séparateur
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 16,
  },
  dividerAccent: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: 16,
    width: 60,
  },

  // Layout
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.muted,
  },
});
