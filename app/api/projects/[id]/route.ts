import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getProjectById,
  updateProject,
  deleteProject,
  validateProject,
} from "@/lib/projects";

// Project reads stay public (the projects page is public), but changes
// require the admin session. Responses are never cached so edits and
// deletes show up at once.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/projects/[id]: returns one project. Public, like the list.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    console.log(`[projects] GET /api/projects/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Project not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[projects] GET /api/projects/${id} -> 200`);
  return NextResponse.json(project, { status: 200, headers: noStore });
}

// Handles PUT /api/projects/[id]: updates the project with the shared
// validation rules (admin only).
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[projects] PUT /api/projects/[id] -> 401");
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
    console.log(`[projects] PUT /api/projects/${id} -> 400 (invalid JSON)`);
    return NextResponse.json(
      { errors: { form: "Invalid JSON in request body." } },
      { status: 400, headers: noStore }
    );
  }

  // Step 2: Extract and trim the fields, tolerating non-string values.
  // This mirrors the POST parsing; problem/approach/result are also read so
  // a client that edits them can, but the admin form omits them and the
  // stored values are kept.
  const data = body as Record<string, unknown>;
  const asString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const techStack = Array.isArray(data.techStack)
    ? (data.techStack as unknown[]).map((tech) =>
        typeof tech === "string" ? tech.trim() : tech
      )
    : data.techStack;
  let video: { src: string; poster: string } | undefined;
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

  // Step 3: Validate with the shared rules (same as creating).
  const errors = validateProject(input);
  if (Object.keys(errors).length > 0) {
    console.log(
      `[projects] PUT /api/projects/${id} -> 400 (validation failed)`
    );
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  // Step 4: Update through the shared projects module (slug is regenerated
  // there when the title changed, staying unique).
  const updated = await updateProject(id, {
    title: input.title,
    category: input.category,
    shortDescription: input.shortDescription,
    techStack: input.techStack as string[],
    ...(video ? { video } : {}),
    ...(typeof data.liveUrl === "string"
      ? { liveUrl: data.liveUrl.trim() || undefined }
      : {}),
    ...(typeof data.problem === "string"
      ? { problem: data.problem.trim() }
      : {}),
    ...(typeof data.approach === "string"
      ? { approach: data.approach.trim() }
      : {}),
    ...(typeof data.result === "string" ? { result: data.result.trim() } : {}),
  });
  if (!updated) {
    console.log(`[projects] PUT /api/projects/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Project not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[projects] PUT /api/projects/${id} -> 200 (slug: ${updated.slug})`);
  return NextResponse.json(updated, { status: 200, headers: noStore });
}

// Handles DELETE /api/projects/[id]: removes the project (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[projects] DELETE /api/projects/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const { id } = await params;
  const deleted = await deleteProject(id);
  if (!deleted) {
    console.log(`[projects] DELETE /api/projects/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Project not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[projects] DELETE /api/projects/${id} -> 200`);
  return NextResponse.json(
    { deleted: true },
    { status: 200, headers: noStore }
  );
}
