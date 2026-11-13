import { createHash } from "crypto";
import { cookies } from "next/headers";

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

// Checks the admin session cookie against the expected token. Used by the
// admin page gate and by every admin server action before it does anything.
export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = getAdminSessionToken();
  if (!expected) {
    return false;
  }
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === expected;
}
