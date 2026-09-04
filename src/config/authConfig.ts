import {simpleHash} from '../utils/simpleHash';

/**
 * This POS has exactly one operator and no backend, so a single fixed local
 * credential is intentionally used instead of a user-management system.
 *
 * To change the password:
 *   1. Run `simpleHash('your-new-password')` once (e.g. in a scratch script).
 *   2. Replace AUTH_PASSWORD_HASH below with the printed value.
 * The plain-text password itself is never stored here.
 *
 * Default credential (change before real use): username "admin", password "cafe@123".
 */
export const AUTH_USERNAME = 'admin';
export const AUTH_PASSWORD_HASH = '39b9fd18c11b8898';

export function verifyCredentials(username: string, password: string): boolean {
  return username.trim() === AUTH_USERNAME && simpleHash(password) === AUTH_PASSWORD_HASH;
}
