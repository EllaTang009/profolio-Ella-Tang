import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Me",
};

const skillGroups = [
  { category: "Data", skills: ["Python", "SQL", "Excel"] },
  { category: "Visualization", skills: ["Power BI", "Tableau"] },
  { category: "Web", skills: ["HTML/CSS", "JavaScript"] },
  { category: "AI", skills: ["Generative AI"] },
];

const timeline = [
  {
    role: "Senior Audit Associate",
    place: "KPMG China",
    note: "Started my career in Big 4 audit.",
  },
  {
    role: "Founder",
    place: "Catering company & automotive content company",
    note: "The automotive content company grew to 1 million followers within 4 months.",
  },
  {
    role: "Teaching Assistant",
    place: "Santa Clara University",
    note: "Teaching Assistant for Tableau and Machine Learning.",
  },
  {
    role: "Information Systems & Web Development Intern",
    place: "TechBeam Real Estate",
    note: "Built the company website end to end.",
  },
];

export default function AboutMe() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="flex justify-center">
          <Image
            src="/images/portrait.jpg"
            alt="Portrait of Ella Tang"
            width={400}
            height={500}
            priority
            className="aspect-[4/5] w-64 max-w-full rounded-xl border border-line object-cover shadow-lg sm:w-72"
          />
        </div>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            About Me
          </h1>
          <p className="mt-6 text-base leading-8 text-secondary sm:text-lg">
            I&apos;m Ella Tang, an MS in Information Systems candidate at Santa
            Clara University, where I also work as a Teaching Assistant for
            Tableau and Machine Learning. I started my career as a Senior Audit
            Associate at KPMG China, then founded and ran two businesses: a
            catering company and an automotive content company that grew to 1
            million followers within 4 months. I&apos;m currently an
            Information Systems and Web Development Intern at TechBeam Real
            Estate, where I built the company website end to end.
          </p>
        </div>
      </div>

      <h2 className="mt-16 text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        Skills
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div
            key={group.category}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              {group.category}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-secondary"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        Experience
      </h2>
      <ol className="mt-6 border-l border-line">
        {timeline.map((item) => (
          <li key={item.role} className="relative pb-8 pl-8 last:pb-0">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-accent bg-background" />
            <p className="font-medium text-foreground">{item.role}</p>
            <p className="mt-1 font-mono text-xs text-accent">{item.place}</p>
            <p className="mt-2 text-sm leading-6 text-secondary">{item.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
