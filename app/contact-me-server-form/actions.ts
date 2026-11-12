"use server";

import { addSubmission } from "@/lib/submissions";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  errors: {
    name?: string;
    email?: string;
    message?: string;
    form?: string;
  };
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Step 1: Read the submitted fields from the FormData object.
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Step 2: Validate on the server (never trust the browser alone).
  const errors: ContactFormState["errors"] = {};
  if (!name) {
    errors.name = "Please enter your name.";
  }
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!message) {
    errors.message = "Please enter a message.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
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
    };
  }

  return { status: "success", errors: {} };
}
