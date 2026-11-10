"use server";

import { promises as fs } from "fs";
import path from "path";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  errors: {
    name?: string;
    email?: string;
    message?: string;
    form?: string;
  };
}

const submissionsPath = path.join(process.cwd(), "data", "submissions.json");

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
    // Step 3: Make sure the data folder exists, then read existing submissions.
    // A failed read (missing file or invalid JSON) simply starts from an empty array.
    await fs.mkdir(path.dirname(submissionsPath), { recursive: true });
    let submissions: unknown[] = [];
    try {
      const raw = await fs.readFile(submissionsPath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      submissions = Array.isArray(parsed) ? parsed : [];
    } catch {
      submissions = [];
    }

    // Step 4: Append the new submission with a unique id and an ISO timestamp.
    submissions.push({
      id: crypto.randomUUID(),
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    });

    // Step 5: Write the updated array back to the JSON file.
    await fs.writeFile(
      submissionsPath,
      JSON.stringify(submissions, null, 2),
      "utf8"
    );
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
