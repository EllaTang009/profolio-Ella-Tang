"use server";

import { addSubmission } from "@/lib/submissions";
import { validateContact, type ContactFormErrors } from "@/lib/validation";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  errors: ContactFormErrors;
  // Submitted values come back on error so the form can re-show them
  // instead of clearing fields the user already filled correctly.
  values?: { name: string; email: string; message: string };
  // Changes on every completed submission so the form remounts with the
  // right contents: kept values on error, empty fields on success.
  key: number;
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Step 1: Read the submitted fields from the FormData object.
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Step 2: Validate with the shared rules (single source of truth).
  const errors = validateContact({ name, email, message });
  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
      values: { name, email, message },
      key: Date.now(),
    };
  }

  try {
    // Step 3: Save through the shared submissions module, tagged as "server-form"
    // so we can tell which form the entry came from.
    await addSubmission({ name, email, message, source: "server-form" });
  } catch (error) {
    console.error("Failed to save submission:", error);
    return {
      status: "error",
      errors: {
        form: "Something went wrong while saving your message. Please try again.",
      },
      values: { name, email, message },
      key: Date.now(),
    };
  }

  // No values on success: the remount clears the fields.
  return { status: "success", errors: {}, key: Date.now() };
}
