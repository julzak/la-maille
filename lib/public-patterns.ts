import { randomBytes } from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { GeneratedPattern } from "./types";
import type { Language } from "./i18n/detect";
import {
  publicGarmentLabels,
  publicNecklineLabels,
  publicSleeveLabels,
  publicPatternStrings,
} from "./i18n/public-pattern";

/**
 * Helpers des pages patrons publiques (BRIEF-03).
 *
 * IMPORTANT securite : la lecture publique passe par un client Supabase
 * ANONYME sans cookies (pas de session, pas de service_role). C'est la
 * policy RLS "Anyone can view public patterns" (is_public = true) qui
 * garantit qu'un patron prive est inaccessible, pas un filtre applicatif.
 */

export const PUBLIC_PATTERN_BASE_URL = "https://la-maille.com";

export interface PublicPatternRow {
  public_slug: string;
  garment_type: string;
  pattern_data: GeneratedPattern;
  created_at: string;
  updated_at: string;
}

/** Client anonyme pur (aucun cookie de session), ou null si env absente. */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Recupere un patron public par slug via le client anonyme.
 * Retourne null si : patron prive (bloque par la RLS), slug inconnu,
 * colonnes absentes (migration pas encore appliquee) ou erreur DB.
 */
export async function fetchPublicPattern(
  slug: string
): Promise<PublicPatternRow | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("saved_patterns")
    .select("public_slug, garment_type, pattern_data, created_at, updated_at")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PublicPatternRow;
}

/**
 * Langue du patron, detectee depuis son contenu (le patron est genere
 * en FR ou EN par pattern-calculator ; la langue n'est pas stockee en DB).
 */
export function detectPatternLanguage(pattern: GeneratedPattern): Language {
  const disclaimer = pattern?.disclaimer || "";
  if (disclaimer.includes("automatically generated")) return "en";
  if (disclaimer.includes("genere automatiquement")) return "fr";

  const enPieceNames = new Set([
    "back",
    "front",
    "body",
    "yoke",
    "sleeves",
    "left front",
    "right front",
  ]);
  const firstPiece = pattern?.pieces?.[0]?.name?.toLowerCase() || "";
  if (enPieceNames.has(firstPiece)) return "en";
  return "fr";
}

/** Description courte du vetement : "pull raglan col rond" / "raglan crew neck sweater". */
export function buildGarmentDescription(
  pattern: GeneratedPattern,
  language: Language
): string {
  const analysis = pattern.analysis;
  const garment =
    publicGarmentLabels[language][analysis.garment.type] ||
    publicGarmentLabels[language].unknown;

  const sleeves =
    analysis.sleeves.type !== "unknown" && analysis.sleeves.type !== "montees"
      ? publicSleeveLabels[language][analysis.sleeves.type]
      : null;
  const neckline =
    analysis.neckline.type !== "unknown" &&
    analysis.neckline.type !== "ouvert-cardigan"
      ? publicNecklineLabels[language][analysis.neckline.type]
      : null;

  if (language === "fr") {
    return [garment, sleeves, neckline].filter(Boolean).join(" ");
  }
  // EN : qualificatifs avant le nom ("raglan crew neck sweater")
  return [sleeves, neckline, garment].filter(Boolean).join(" ");
}

/** Titre auto-genere de la page publique (sans nom d'auteur, sans nom perso). */
export function buildPublicTitle(
  pattern: GeneratedPattern,
  language: Language
): string {
  const desc = buildGarmentDescription(pattern, language);
  if (language === "fr") {
    return `${publicPatternStrings.fr.titlePrefix}${desc}`;
  }
  const capitalized = desc.charAt(0).toUpperCase() + desc.slice(1);
  return `${capitalized} knitting pattern`;
}

/** Meta description de la page publique. */
export function buildPublicDescription(
  pattern: GeneratedPattern,
  language: Language
): string {
  const desc = buildGarmentDescription(pattern, language);
  return publicPatternStrings[language].descriptionTemplate
    .replace("{desc}", desc)
    .replace("{sts}", String(pattern.gauge.stitchesPer10cm))
    .replace("{rows}", String(pattern.gauge.rowsPer10cm))
    .replace("{needle}", String(pattern.gauge.needleSize));
}

/** Slugifie un texte : minuscules, sans accents, tirets simples. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Genere un slug lisible + suffixe aleatoire court non devinable.
 * Ex : "pull-raglan-col-rond-a1b2c3".
 */
export function generatePublicSlug(
  pattern: GeneratedPattern,
  language: Language
): string {
  const base = slugify(buildGarmentDescription(pattern, language)) || "patron";
  // 6 caracteres hexa (~16.7M combinaisons) : suffit a rendre l'URL non
  // devinable tout en restant courte et lisible.
  const suffix = randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}
