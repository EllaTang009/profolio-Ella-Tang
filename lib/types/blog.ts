// Shared blog types — no Node imports, so both server modules
// (lib/blogs.ts) and client components can import this file safely.

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface NewBlogPost {
  title: string;
  summary: string;
  content: string;
}

// Shared validation for create and update: every field must be
// non-blank after trimming. Field errors mirror the contact form style.
// (Lives here because it is pure: no Node imports needed.)
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
