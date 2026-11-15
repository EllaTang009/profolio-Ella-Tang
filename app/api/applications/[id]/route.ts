import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
  validateApplication,
  type ApplicationStatus,
} from "@/lib/applications";

// The application list is private, so every endpoint requires the admin
// session. Responses are never cached so the tracker always shows the
// latest JSON file contents.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/applications/[id]: returns one application.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[applications] GET /api/applications/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    console.log(`[applications] GET /api/applications/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Application not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[applications] GET /api/applications/${id} -> 200`);
  return NextResponse.json(application, { status: 200, headers: noStore });
}

// Handles PUT /api/applications/[id]: updates the application with the
// shared validation rules.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[applications] PUT /api/applications/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const { id } = await params;

  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log(
      `[applications] PUT /api/applications/${id} -> 400 (invalid JSON)`
    );
    return NextResponse.json(
      { errors: { form: "Invalid JSON in request body." } },
      { status: 400, headers: noStore }
    );
  }

  // Step 2: Extract and trim the fields, tolerating non-string values.
  const data = body as Record<string, unknown>;
  const asString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const input = {
    company: asString(data.company),
    role: asString(data.role),
    location: asString(data.location),
    status: asString(data.status),
    appliedDate: asString(data.appliedDate),
    link: asString(data.link),
    notes: asString(data.notes),
  };

  // Step 3: Validate with the shared rules (same as creating).
  const errors = validateApplication(input);
  if (Object.keys(errors).length > 0) {
    console.log(
      `[applications] PUT /api/applications/${id} -> 400 (validation failed)`
    );
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  // Step 4: Update through the shared applications module. Validation
  // already confirmed the status is one of the allowed values.
  const updated = await updateApplication(id, {
    ...input,
    status: input.status as ApplicationStatus,
  });
  if (!updated) {
    console.log(`[applications] PUT /api/applications/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Application not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[applications] PUT /api/applications/${id} -> 200`);
  return NextResponse.json(updated, { status: 200, headers: noStore });
}

// Handles DELETE /api/applications/[id]: removes the application.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[applications] DELETE /api/applications/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const { id } = await params;
  const deleted = await deleteApplication(id);
  if (!deleted) {
    console.log(`[applications] DELETE /api/applications/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Application not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[applications] DELETE /api/applications/${id} -> 200`);
  return NextResponse.json(
    { deleted: true },
    { status: 200, headers: noStore }
  );
}
