import { NextResponse } from "next/server";
import {
  addBlog,
  getBlogs,
  validateBlog,
  type BlogPost,
} from "@/lib/blogs";

// Blog reads stay public (the blog page is public), but responses are
// never cached so the list always reflects the latest JSON file.
const noStore = { "Cache-Control": "no-store" };

// Handles GET /api/blogs: returns all posts, newest first.
export async function GET() {
  const blogs = await getBlogs();
  const sorted = [...blogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  console.log(`[blogs] GET /api/blogs -> 200 (${sorted.length} posts)`);
  return NextResponse.json(sorted, { status: 200, headers: noStore });
}

// Handles POST /api/blogs: create a post from a JSON body.
export async function POST(request: Request) {
  // Step 1: Parse the JSON body. Malformed JSON gets a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log("[blogs] POST /api/blogs -> 400 (invalid JSON)");
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

  // Step 3: Validate with the shared rules.
  const errors = validateBlog({ title, summary, content });
  if (Object.keys(errors).length > 0) {
    console.log(`[blogs] POST /api/blogs -> 400 (validation failed)`);
    return NextResponse.json({ errors }, { status: 400, headers: noStore });
  }

  try {
    // Step 4: Save through the shared blogs module (slug generated here).
    const post: BlogPost = await addBlog({ title, summary, content });
    console.log(`[blogs] POST /api/blogs -> 201 (slug: ${post.slug})`);
    return NextResponse.json({ post }, { status: 201, headers: noStore });
  } catch (error) {
    // Step 5: Unexpected failures (e.g. disk write errors) get a 500.
    console.error("Failed to save blog post:", error);
    console.log("[blogs] POST /api/blogs -> 500");
    return NextResponse.json(
      { errors: { form: "Something went wrong while saving the post." } },
      { status: 500, headers: noStore }
    );
  }
}
