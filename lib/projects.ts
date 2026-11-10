export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  techStack: string[];
}

export const projects: Project[] = [
  {
    slug: "roblox-interview-agent",
    title: "AI Interviewer Rating Agent",
    shortDescription:
      "A practicum project for Roblox: an AI agent that evaluates interviewer performance across 13 rubrics.",
    longDescription:
      "A practicum project for Roblox. An AI agent that evaluates interviewer performance across 13 rubrics to help the company see whether interviewers performed well.",
    techStack: ["Python", "Generative AI"],
  },
  {
    slug: "f1-performance-analysis",
    title: "Formula 1 Driver Performance Analysis",
    shortDescription:
      "A Python project investigating what drives Formula 1 driver performance using statistical modeling.",
    longDescription:
      "A Python project that investigates hypotheses about what drives Formula 1 driver performance using statistical modeling. Received positive feedback from the professor and peers.",
    techStack: ["Python", "pandas", "Statistical Modeling"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
