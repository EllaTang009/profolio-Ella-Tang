import { promises as fs } from "fs";
import path from "path";

export interface NewBlogPost {
  title: string;
  summary: string;
  content: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

const blogsPath = path.join(process.cwd(), "data", "blogs.json");

export async function getBlogs(): Promise<BlogPost[]> {
  // A failed read (missing file or invalid JSON) simply starts from an empty array.
  try {
    const raw = await fs.readFile(blogsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BlogPost[]) : [];
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const blogs = await getBlogs();
  return blogs.find((post) => post.slug === slug);
}

// Turns a title into a URL-friendly slug and keeps it unique by appending
// -2, -3, ... when another post already uses it.
function uniqueSlug(title: string, blogs: BlogPost[]): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "post";
  let slug = base;
  let n = 2;
  while (blogs.some((post) => post.slug === slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

export async function addBlog(input: NewBlogPost): Promise<BlogPost> {
  // Make sure the data folder exists before writing.
  await fs.mkdir(path.dirname(blogsPath), { recursive: true });

  const blogs = await getBlogs();

  const post: BlogPost = {
    ...input,
    id: crypto.randomUUID(),
    slug: uniqueSlug(input.title, blogs),
    createdAt: new Date().toISOString(),
  };
  blogs.push(post);

  await fs.writeFile(blogsPath, JSON.stringify(blogs, null, 2), "utf8");

  return post;
}

// Shared validation for create and (later) update: every field must be
// non-blank after trimming. Field errors mirror the contact form style.
export function validateBlog(input: NewBlogPost): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title) {
    errors.title = "Please enter a title.";
  }
  if (!input.summary) {
    errors.summary = "Please enter a summary.";
  }
  if (!input.content) {
    errors.content = "Please enter the post content.";
  }
  return errors;
}
