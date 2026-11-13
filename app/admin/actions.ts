"use server";

import { createHash } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionToken, isAdminAuthenticated } from "./auth";
import { deleteSubmission } from "@/lib/submissions";

export interface LoginFormState {
  error?: string;
}

export async function loginAdmin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "");

  // Check the submitted password on the server against the environment
  // variable. Never leak whether the variable is configured.
  const expected = getAdminSessionToken();
  const submitted = createHash("sha256").update(password).digest("hex");
  if (!expected || submitted !== expected) {
    return { error: "Incorrect password." };
  }

  // Store the session token in an httpOnly cookie; the page treats a
  // matching cookie as "logged in".
  const cookieStore = await cookies();
  cookieStore.set("admin_session", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  // Full reload of /admin so the gated content renders with the new cookie.
  redirect("/admin");
}

export async function logoutAdmin() {
  // Clear the session cookie; the gate then shows the password form again.
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}

export async function deleteSubmissionAction(formData: FormData) {
  // Server-side session check: requests without a valid admin cookie
  // are rejected before any file access happens.
  if (!(await isAdminAuthenticated())) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteSubmission(id);
  }

  // Refresh the table so the deleted row disappears immediately.
  revalidatePath("/admin");
}
