/**
 * A small, dependency-free, deterministic hash used only so the local
 * operator password is not kept in plain text in the source/config file.
 *
 * This is NOT a cryptographic hash (no salt, not collision-resistant) and
 * must not be used for anything beyond this single-device, single-operator,
 * offline login screen. Adding a real crypto library (bcrypt, etc.) was
 * judged unnecessary complexity for a one-credential local POS app.
 */
export function simpleHash(value: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x1000193;

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    hash1 = (hash1 ^ code) >>> 0;
    hash1 = Math.imul(hash1, 16777619) >>> 0;
    hash2 = (hash2 + code) >>> 0;
    hash2 = Math.imul(hash2, 2654435761) >>> 0;
  }

  return `${hash1.toString(16).padStart(8, '0')}${hash2.toString(16).padStart(8, '0')}`;
}
