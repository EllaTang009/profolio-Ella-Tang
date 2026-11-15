import { promises as fs } from "fs";
import path from "path";
import type { NewProject, Project } from "@/lib/types/project";

// Re-exported so existing imports keep working and all project access
// stays reachable from one module.
export { validateProject } from "@/lib/types/project";
export type {
  NewProject,
  Project,
  ProjectFieldErrors,
  ProjectFormErrors,
  ProjectVideo,
} from "@/lib/types/project";

const projectsPath = path.join(process.cwd(), "data", "projects.json");

// All JSON file access lives in this module. The pages and API routes
// only ever call these functions.
export async function getProjects(): Promise<Project[]> {
  // A failed read (missing file or invalid JSON) simply starts from an empty array.
  try {
    const raw = await fs.readFile(projectsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Project[]) : [];
  } catch {
    return [];
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getProjectById(
  id: string
): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id);
}

// Turns a title into a URL-friendly slug and keeps it unique by appending
// -2, -3, ... when another project already uses it.
function uniqueSlug(title: string, projects: Project[]): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";
  let slug = base;
  let n = 2;
  while (projects.some((project) => project.slug === slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

export async function addProject(input: NewProject): Promise<Project> {
  // Make sure the data folder exists before writing.
  await fs.mkdir(path.dirname(projectsPath), { recursive: true });

  const projects = await getProjects();

  const project: Project = {
    id: crypto.randomUUID(),
    slug: uniqueSlug(input.title, projects),
    title: input.title,
    category: input.category,
    shortDescription: input.shortDescription,
    problem: input.problem ?? "",
    approach: input.approach ?? "",
    result: input.result ?? "",
    techStack: input.techStack,
    ...(input.video ? { video: input.video } : {}),
    ...(input.liveUrl ? { liveUrl: input.liveUrl } : {}),
    createdAt: new Date().toISOString(),
  };
  projects.push(project);

  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), "utf8");
  return project;
}

export async function updateProject(
  id: string,
  input: NewProject
): Promise<Project | undefined> {
  const projects = await getProjects();

  // Unknown id: nothing is written, so the caller knows it failed.
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) {
    return undefined;
  }

  // If the title changed, regenerate the slug and keep it unique among the
  // OTHER projects (the project being edited must not collide with itself).
  let slug = projects[index].slug;
  if (input.title !== projects[index].title) {
    const others = projects.filter((project) => project.id !== id);
    slug = uniqueSlug(input.title, others);
  }

  // problem/approach/result fall back to the stored values: the admin form
  // does not edit the case study sections.
  const updated: Project = {
    ...projects[index],
    slug,
    title: input.title,
    category: input.category,
    shortDescription: input.shortDescription,
    problem: input.problem ?? projects[index].problem,
    approach: input.approach ?? projects[index].approach,
    result: input.result ?? projects[index].result,
    techStack: input.techStack,
    ...(input.video ? { video: input.video } : { video: undefined }),
    ...(input.liveUrl ? { liveUrl: input.liveUrl } : { liveUrl: undefined }),
  };
  projects[index] = updated;

  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), "utf8");
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const remaining = projects.filter((project) => project.id !== id);

  // Unknown id: nothing to write, so the caller knows the delete failed.
  if (remaining.length === projects.length) {
    return false;
  }

  await fs.writeFile(projectsPath, JSON.stringify(remaining, null, 2), "utf8");
  return true;
}
