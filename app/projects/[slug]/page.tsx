import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug, projects } from "@/lib/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project not found" };
  }
  return { title: project.title };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Project not found
        </h1>
        <p className="mt-4 max-w-md text-zinc-600">
          Sorry, there is no project matching{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
            /projects/{slug}
          </code>
          .
        </p>
        <Link
          href="/projects"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Back to Projects
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <Link
        href="/projects"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        &larr; Back to Projects
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
        {project.title}
      </h1>
      <ul className="mt-5 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {tech}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-900">
          About this project
        </h2>
        <p className="mt-4 text-base leading-8 text-zinc-600">
          {project.longDescription}
        </p>
      </div>
    </section>
  );
}
