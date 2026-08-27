import { customAlphabet } from "nanoid";

// Alphanumeric only — keeps short URLs clean and QR-friendly (no "-" or "_").
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const generateCode = customAlphabet(alphabet, 7);

// Custom short codes: letters, digits, hyphen and underscore, 1–50 chars.
// This is what goes after /r/, so it must be URL-path safe.
const CODE_PATTERN = /^[A-Za-z0-9_-]{1,50}$/;

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}
