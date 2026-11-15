import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "@/lib/submissions";
import { validateContact } from "@/lib/validation";

// Handles GET /api/contact/[id]: returns one submission (admin only).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[contact] GET /api/contact/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) {
    console.log(`[contact] GET /api/contact/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Submission not found." } },
      { status: 404 }
    );
  }

  console.log(`[contact] GET /api/contact/${id} -> 200`);
  return NextResponse.json(submission, { status: 200 });
}

// Handles PUT /api/contact/[id]: updates name, email, and message with the
// shared validation rules (admin only).
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[contact] PUT /api/contact/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401 }
    );
  }

  const { id } = await params;

  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log(`[contact] PUT /api/contact/${id} -> 400 (invalid JSON)`);
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

  // Step 3: Validate with the shared rules (same as creating).
  const errors = validateContact({ name, email, message });
  if (Object.keys(errors).length > 0) {
    console.log(`[contact] PUT /api/contact/${id} -> 400 (validation failed)`);
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Step 4: Update through the shared submissions module.
  const updated = await updateSubmission(id, { name, email, message });
  if (!updated) {
    console.log(`[contact] PUT /api/contact/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Submission not found." } },
      { status: 404 }
    );
  }

  console.log(`[contact] PUT /api/contact/${id} -> 200`);
  return NextResponse.json(updated, { status: 200 });
}

// Handles DELETE /api/contact/[id]: removes the submission (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[contact] DELETE /api/contact/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const deleted = await deleteSubmission(id);
  if (!deleted) {
    console.log(`[contact] DELETE /api/contact/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Submission not found." } },
      { status: 404 }
    );
  }

  console.log(`[contact] DELETE /api/contact/${id} -> 200`);
  return NextResponse.json({ deleted: true }, { status: 200 });
}
