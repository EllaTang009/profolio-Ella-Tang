export interface Project {
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
  video?: {
    src: string;
    poster: string;
  };
  // Optional external link to the deployed site, shown on the detail page.
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    slug: "roblox-interview-agent",
    title: "AI Interviewer Rating Agent",
    category: "AI Practicum",
    shortDescription:
      "A practicum project for Roblox: an AI agent that evaluates interviewer performance across 13 rubrics.",
    problem:
      "Roblox needed a reliable way to see whether interviewers performed well during their interviews.",
    approach:
      "As a practicum project for Roblox, I built an AI agent that evaluates interviewer performance across 13 rubrics, turning interview sessions into structured, comparable results.",
    result:
      "The agent gives Roblox a structured picture of interviewer performance across all 13 rubrics instead of relying on manual review.",
    techStack: ["Python", "Generative AI"],
    video: {
      src: "/videos/roblox.mp4",
      poster: "/videos/roblox-poster.jpg",
    },
  },
  {
    slug: "f1-performance-analysis",
    title: "Formula 1 Driver Performance Analysis",
    category: "Data Analysis",
    shortDescription:
      "A Python project investigating what drives Formula 1 driver performance using statistical modeling.",
    problem:
      "What actually drives Formula 1 driver performance? The project set out to test hypotheses instead of assuming.",
    approach:
      "Used Python with pandas and statistical modeling to investigate hypotheses about the factors behind driver performance.",
    result:
      "The analysis was well received, earning positive feedback from the professor and peers.",
    techStack: ["Python", "pandas", "Statistical Modeling"],
    video: {
      src: "/videos/f1.mp4",
      poster: "/videos/f1-poster.jpg",
    },
  },
  {
    slug: "ripple-realty-group",
    title: "Ripple Realty Group Website",
    category: "Web Development",
    shortDescription:
      "A real estate company website I built end to end, serving the Silicon Valley and Boston markets.",
    problem:
      "The company needed a professional website to present its listings and turn visitors into client inquiries.",
    approach:
      "I mapped the site structure, designed the property listing and contact pages, and implemented the page layouts in HTML/CSS and JavaScript. After launch, I used site analytics and user feedback to simplify the navigation, restructure the above-the-fold content and listing cards, and compress image assets.",
    result: "Faster page load times and more contact form submissions.",
    techStack: ["HTML", "CSS", "JavaScript", "Site Analytics"],
    video: {
      src: "/videos/ripple.mp4",
      poster: "/videos/ripple-poster.jpg",
    },
    liveUrl: "https://www.ripplerealtygroup.com/",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
