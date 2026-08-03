/**
 * Limites de rate limit sur /api/analyze (BRIEF-02).
 * Fenetre glissante de RATE_LIMIT_WINDOW_HOURS heures, comptee via une
 * requete SQL sur public.generations (pas de nouvelle infra).
 *
 * Fichier volontairement sans dependance Node (pas d'import "crypto") :
 * il est importe a la fois par la route serveur (lib/rate-limit.ts) et par
 * le composant client /analyse pour construire le message d'erreur i18n.
 */
export const ANONYMOUS_DAILY_LIMIT = 5;
export const AUTHENTICATED_DAILY_LIMIT = 15;
export const RATE_LIMIT_WINDOW_HOURS = 24;
