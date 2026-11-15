import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/admin/auth";
import {
  getBlogById,
  updateBlog,
  deleteBlog,
  validateBlog,
} from "@/lib/blogs";

// Blog reads stay public (the blog page is public), but changes are admin
// only. Responses are never cached so edits and deletes show up at once.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/blogs/[id]: returns one post. Public, like the list.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) {
    console.log(`[blogs] GET /api/blogs/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Post not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[blogs] GET /api/blogs/${id} -> 200`);
  return NextResponse.json(post, { status: 200, headers: noStore });
}

// Handles PUT /api/blogs/[id]: updates the post with the shared validation
// rules (admin only).
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[blogs] PUT /api/blogs/[id] -> 401");
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
    console.log(`[blogs] PUT /api/blogs/${id} -> 400 (invalid JSON)`);
    return NextResponse.json(
      { errors: { form: "Invalid JSON in request body." } },
      { status: 400, headers: noStore }
    );
  }

  // Step 2: Extract and trim the fields, tolerating non-string values.
  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  const content = typeof data.content === "string" ? data.content.trim() : "";

  // Step 3: Validate with the shared rules (same as creating).
  const errors = validateBlog({ title, summary, content });
  if (Object.keys(errors).length > 0) {
    console.log(`[blogs] PUT /api/blogs/${id} -> 400 (validation failed)`);
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  // Step 4: Update through the shared blogs module (slug is regenerated
  // there when the title changed, staying unique).
  const updated = await updateBlog(id, { title, summary, content });
  if (!updated) {
    console.log(`[blogs] PUT /api/blogs/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Post not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[blogs] PUT /api/blogs/${id} -> 200 (slug: ${updated.slug})`);
  return NextResponse.json(updated, { status: 200, headers: noStore });
}

// Handles DELETE /api/blogs/[id]: removes the post (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    console.log("[blogs] DELETE /api/blogs/[id] -> 401");
    return NextResponse.json(
      { errors: { form: "Unauthorized. Please log in as admin." } },
      { status: 401, headers: noStore }
    );
  }

  const { id } = await params;
  const deleted = await deleteBlog(id);
  if (!deleted) {
    console.log(`[blogs] DELETE /api/blogs/${id} -> 404`);
    return NextResponse.json(
      { errors: { form: "Post not found." } },
      { status: 404, headers: noStore }
    );
  }

  console.log(`[blogs] DELETE /api/blogs/${id} -> 200`);
  return NextResponse.json({ deleted: true }, { status: 200, headers: noStore });
}
