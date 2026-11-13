import { createHash } from "crypto";

// Derives the admin session token from the ADMIN_PASSWORD environment
// variable. Hashing means the raw password is never stored in the cookie.
// Returns null when the variable is not configured (access is then denied).
export function getAdminSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return null;
  }
  return createHash("sha256").update(password).digest("hex");
}
