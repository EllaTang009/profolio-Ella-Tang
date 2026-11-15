import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getApplications,
  addApplication,
  validateApplication,
  type ApplicationStatus,
} from "@/lib/applications";

// The application list is private, so every endpoint requires the admin
// session. Responses are never cached so the tracker always shows the
// latest JSON file contents.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/applications: returns all applications, newest first
// (by application date, then creation time).
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    console.log("[applications] GET /api/applications -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const applications = await getApplications();
  const sorted = [...applications].sort((a, b) => {
    if (a.appliedDate !== b.appliedDate) {
      return b.appliedDate.localeCompare(a.appliedDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
  console.log(
    `[applications] GET /api/applications -> 200 (${sorted.length} applications)`
  );
  return NextResponse.json(sorted, { status: 200, headers: noStore });
}

// Handles POST /api/applications: creates an application from a JSON body.
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    console.log("[applications] POST /api/applications -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log("[applications] POST /api/applications -> 400 (invalid JSON)");
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

  // Step 3: Validate with the shared rules (single source of truth).
  const errors = validateApplication(input);
  if (Object.keys(errors).length > 0) {
    console.log("[applications] POST /api/applications -> 400 (validation failed)");
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  try {
    // Step 4: Save through the shared applications module. Validation
    // already confirmed the status is one of the allowed values.
    const application = await addApplication({
      ...input,
      status: input.status as ApplicationStatus,
    });
    console.log(
      `[applications] POST /api/applications -> 201 (id: ${application.id})`
    );
    return NextResponse.json({ application }, { status: 201, headers: noStore });
  } catch (error) {
    // Step 5: Unexpected failures (e.g. disk write errors) get a 500.
    console.error("Failed to save application:", error);
    console.log("[applications] POST /api/applications -> 500");
    return NextResponse.json(
      { errors: { form: "Something went wrong while saving the application." } },
      { status: 500, headers: noStore }
    );
  }
}
