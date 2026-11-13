import type { Metadata } from "next";
import Link from "next/link";
import BannerVideo from "@/app/components/BannerVideo";
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
        <h1 className="type-h2">Project not found</h1>
        <p className="type-body mt-4">
          Sorry, there is no project matching{" "}
          <code className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[13px] text-foreground">
            /projects/{slug}
          </code>
          .
        </p>
        <Link
          href="/projects"
          className="btn-secondary mt-8 inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
        >
          Back to Projects
        </Link>
      </section>
    );
  }

  const sections = [
    { label: "Problem", text: project.problem },
    { label: "Approach", text: project.approach },
    { label: "Result", text: project.result },
  ];

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <Link
        href="/projects"
        className="font-mono text-[13px] text-secondary transition-colors hover:text-foreground"
      >
        &larr; Back to Projects
      </Link>

      {project.video && (
        <BannerVideo
          src={project.video.src}
          poster={project.video.poster}
          label={`${project.title} banner`}
          className="mt-8 aspect-[16/10] w-full rounded-xl border border-line object-cover"
        />
      )}

      <p className="mt-8 font-mono text-[13px] text-accent">
        {project.category}
      </p>
      <h1 className="type-h2 mt-3">{project.title}</h1>

      <ul className="mt-6 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <li
            key={tech}
            className="rounded-md border border-line px-2 py-0.5 font-mono text-[13px] text-secondary"
          >
            {tech}
          </li>
        ))}
      </ul>

      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-8 inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
        >
          Visit live site
        </a>
      )}

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <div key={section.label}>
            <h2 className="font-mono text-[13px] uppercase tracking-wider text-accent">
              {section.label}
            </h2>
            <p className="type-body mt-3">{section.text}</p>
          </div>
        ))}

        <div>
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-accent">
            Tech Stack
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[13px] text-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
