/**
 * Validation email minimale et partagee entre le client (EmailGateModal) et
 * le serveur (/api/subscribe). Volontairement stricte pour rejeter "foo@"
 * tout en acceptant les adresses courantes.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
