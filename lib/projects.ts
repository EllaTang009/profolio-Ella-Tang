export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  problem: string;
  approach: string;
  result: string;
  techStack: string[];
}

export const projects: Project[] = [
  {
    slug: "roblox-interview-agent",
    title: "AI Interviewer Rating Agent",
    shortDescription:
      "A practicum project for Roblox: an AI agent that evaluates interviewer performance across 13 rubrics.",
    problem:
      "Roblox needed a reliable way to see whether interviewers performed well during their interviews.",
    approach:
      "As a practicum project for Roblox, I built an AI agent that evaluates interviewer performance across 13 rubrics, turning interview sessions into structured, comparable results.",
    result:
      "The agent gives Roblox a structured picture of interviewer performance across all 13 rubrics instead of relying on manual review.",
    techStack: ["Python", "Generative AI"],
  },
  {
    slug: "f1-performance-analysis",
    title: "Formula 1 Driver Performance Analysis",
    shortDescription:
      "A Python project investigating what drives Formula 1 driver performance using statistical modeling.",
    problem:
      "What actually drives Formula 1 driver performance? The project set out to test hypotheses instead of assuming.",
    approach:
      "Used Python with pandas and statistical modeling to investigate hypotheses about the factors behind driver performance.",
    result:
      "The analysis was well received, earning positive feedback from the professor and peers.",
    techStack: ["Python", "pandas", "Statistical Modeling"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
