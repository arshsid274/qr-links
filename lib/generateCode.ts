import { customAlphabet } from "nanoid";

// Alphanumeric only — keeps short URLs clean and QR-friendly (no "-" or "_").
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const generateCode = customAlphabet(alphabet, 7);
