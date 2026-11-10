import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Me",
};

const skills = [
  "Python",
  "SQL",
  "Excel",
  "Power BI",
  "Tableau",
  "HTML/CSS",
  "JavaScript",
  "Data Analytics",
  "Generative AI",
];

export default function AboutMe() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="flex justify-center">
          <Image
            src="/profile.jpg"
            alt="Portrait of Ella Tang"
            width={384}
            height={384}
            priority
            className="h-auto w-64 max-w-full rounded-2xl object-cover shadow-lg sm:w-80"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            About Me
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
            I&apos;m Ella Tang, an MS in Information Systems candidate at Santa
            Clara University, where I also work as a Teaching Assistant for
            Tableau and Machine Learning. I started my career as a Senior Audit
            Associate at KPMG China, then founded and ran two businesses: a
            catering company and an automotive content company that grew to 1
            million followers. I&apos;m currently an Information Systems and
            Web Development Intern at TechBeam Real Estate, where I built the
            company website end to end.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          Skills
        </h2>
        <ul className="mt-5 flex flex-wrap gap-3">
          {skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
