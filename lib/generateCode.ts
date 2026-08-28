import { customAlphabet } from "nanoid";

// Alphanumeric only — keeps short URLs clean and QR-friendly (no "-" or "_").
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const generateCode = customAlphabet(alphabet, 7);

// Custom short codes: letters, digits, dot, hyphen and underscore, 1–50 chars.
// This is what goes after /r/, so it must be a single URL-path segment.
// Dots are allowed (e.g. "abc.com" → /r/abc.com), but a code that is only
// dots (".", "..") is rejected since those are path navigation, not a slug.
const CODE_PATTERN = /^[A-Za-z0-9._-]{1,50}$/;

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code) && !/^\.+$/.test(code);
}
