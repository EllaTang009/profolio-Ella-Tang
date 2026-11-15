import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import { getSubmissions, addSubmission } from "@/lib/submissions";
import { validateContact } from "@/lib/validation";

// Never cached: the table must always reflect the latest JSON file.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/contact: returns all submissions, newest first.
// Protected because submissions contain personal data.
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    console.log("[contact] GET /api/contact -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const submissions = await getSubmissions();
  const sorted = [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
  console.log(`[contact] GET /api/contact -> 200 (${sorted.length} submissions)`);
  return NextResponse.json(sorted, { status: 200, headers: noStore });
}

// Handles POST /api/contact: create a submission from a JSON body.
// Stays public — this is the form visitors use.
export async function POST(request: Request) {
  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log("[contact] POST /api/contact -> 400 (invalid JSON)");
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
    console.log("[contact] POST /api/contact -> 400 (validation failed)");
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
    console.log(`[contact] POST /api/contact -> 201 (id: ${submission.id})`);
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    // Step 5: Unexpected failures (e.g. disk write errors) get a 500.
    console.error("Failed to save submission:", error);
    console.log("[contact] POST /api/contact -> 500");
    return NextResponse.json(
      { errors: { form: "Something went wrong while saving your message." } },
      { status: 500 }
    );
  }
}
