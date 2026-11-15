// Shared project types — no Node imports, so both server modules
// (lib/projects.ts) and client components can import this file safely.

export interface ProjectVideo {
  src: string;
  poster: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  problem: string;
  approach: string;
  result: string;
  techStack: string[];
  // Optional preview video shown on the project card (hover to play)
  // and as a banner on the detail page. Poster is the idle frame.
  // Projects without a video fall back to the placeholder graphic.
  video?: ProjectVideo;
  // Optional external link to the deployed site, shown on the detail page.
  liveUrl?: string;
  createdAt: string;
}

// The fields sent to addProject/updateProject. problem/approach/result are
// optional: the admin form does not edit them, so updates keep the stored
// values and new projects start with empty sections.
export interface NewProject {
  title: string;
  category: string;
  shortDescription: string;
  problem?: string;
  approach?: string;
  result?: string;
  techStack: string[];
  video?: ProjectVideo;
  liveUrl?: string;
}

export interface ProjectFieldErrors {
  title?: string;
  summary?: string;
  category?: string;
  techStack?: string;
}

// Field errors plus an optional form-level message for problems that are
// not tied to one field (malformed JSON, save failures, network errors).
export type ProjectFormErrors = ProjectFieldErrors & { form?: string };

// Single source of truth for project validation. Called by the API routes
// before any write. "summary" is the user-facing name of shortDescription.
// (Lives here because it is pure: no Node imports needed.)
export function validateProject(input: {
  title: string;
  shortDescription: string;
  category: string;
  techStack: unknown;
}): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {};

  if (!input.title) {
    errors.title = "Please enter a title.";
  }
  if (!input.shortDescription) {
    errors.summary = "Please enter a summary.";
  }
  if (!input.category) {
    errors.category = "Please enter a category.";
  }
  // Tech stack must be a list of strings. Empty is allowed; blank entries
  // and non-string entries are rejected so the cards always render tags.
  if (
    !Array.isArray(input.techStack) ||
    input.techStack.some((tech) => typeof tech !== "string")
  ) {
    errors.techStack = "Tech stack must be a list of technologies.";
  }
  return errors;
}
