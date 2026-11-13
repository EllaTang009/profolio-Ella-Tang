import { NextResponse } from "next/server";
import { addSubmission } from "@/lib/submissions";
import { validateContact } from "@/lib/validation";

// Handles POST /api/contact: receive a JSON body, validate it, and store it.
export async function POST(request: Request) {
  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { form: "Invalid JSON in request body." } },
      { status: 400 }
    );
  }

  // Step 2: Extract and trim the fields, tolerating non-string values.
  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  // Step 3: Validate with the shared rules (single source of truth).
  const errors = validateContact({ name, email, message });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    // Step 4: Save through the shared submissions module, tagged as "api".
    const submission = await addSubmission({
      name,
      email,
      message,
      source: "api",
    });
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    // Step 5: Unexpected failures (e.g. disk write errors) get a 500.
    console.error("Failed to save submission:", error);
    return NextResponse.json(
      { errors: { form: "Something went wrong while saving your message." } },
      { status: 500 }
    );
  }
}
