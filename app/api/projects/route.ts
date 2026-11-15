import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getProjects,
  addProject,
  validateProject,
  type ProjectVideo,
} from "@/lib/projects";

// Project reads stay public (the projects page is public), but changes
// require the admin session. Responses are never cached so the list always
// reflects the latest JSON file contents.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/projects: returns all projects, oldest creation first
// (matches the original hand-written order; new projects go last).
export async function GET() {
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  console.log(`[projects] GET /api/projects -> 200 (${sorted.length} projects)`);
  return NextResponse.json(sorted, { status: 200, headers: noStore });
}

// Handles POST /api/projects: creates a project from a JSON body (admin only).
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    console.log("[projects] POST /api/projects -> 401");
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
    console.log("[projects] POST /api/projects -> 400 (invalid JSON)");
    return NextResponse.json(
      { errors: { form: "Invalid JSON in request body." } },
      { status: 400, headers: noStore }
    );
  }

  // Step 2: Extract and trim the fields, tolerating non-string values.
  const data = body as Record<string, unknown>;
  const asString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  // Tech stack arrives as an array (the form sends it comma-separated and
  // splits it client-side); anything else fails validation below.
  const techStack = Array.isArray(data.techStack)
    ? (data.techStack as unknown[]).map((tech) =>
        typeof tech === "string" ? tech.trim() : tech
      )
    : data.techStack;
  // Video arrives as an object with src and poster strings, or is omitted.
  let video: ProjectVideo | undefined;
  if (
    data.video &&
    typeof data.video === "object" &&
    typeof (data.video as Record<string, unknown>).src === "string" &&
    typeof (data.video as Record<string, unknown>).poster === "string"
  ) {
    const rawVideo = data.video as Record<string, unknown>;
    const src = (rawVideo.src as string).trim();
    const poster = (rawVideo.poster as string).trim();
    if (src && poster) {
      video = { src, poster };
    }
  }

  const input = {
    title: asString(data.title),
    shortDescription: asString(data.shortDescription ?? data.summary),
    category: asString(data.category),
    techStack,
  };

  // Step 3: Validate with the shared rules (single source of truth).
  const errors = validateProject(input);
  if (Object.keys(errors).length > 0) {
    console.log("[projects] POST /api/projects -> 400 (validation failed)");
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  try {
    // Step 4: Save through the shared projects module (slug generated here).
    const project = await addProject({
      title: input.title,
      category: input.category,
      shortDescription: input.shortDescription,
      techStack: input.techStack as string[],
      ...(video ? { video } : {}),
      ...(typeof data.liveUrl === "string" && data.liveUrl.trim()
        ? { liveUrl: data.liveUrl.trim() }
        : {}),
    });
    console.log(
      `[projects] POST /api/projects -> 201 (slug: ${project.slug})`
    );
    return NextResponse.json({ project }, { status: 201, headers: noStore });
  } catch (error) {
    // Step 5: Unexpected failures (e.g. disk write errors) get a 500.
    console.error("Failed to save project:", error);
    console.log("[projects] POST /api/projects -> 500");
    return NextResponse.json(
      { errors: { form: "Something went wrong while saving the project." } },
      { status: 500, headers: noStore }
    );
  }
}
