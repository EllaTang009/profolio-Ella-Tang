"use client";

import { useRef, useState } from "react";
import { Placeholder } from "@/app/components/BannerVideo";

// The whole card is a single client component, so the mouse handlers sit
// directly on the outermost element (the link) and drive the video via a
// ref. No overlays, no guards: enter plays, leave rewinds.
export default function ProjectCard({
  href,
  number,
  category,
  title,
  description,
  tags,
  video,
  className,
}: {
  href: string;
  number: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  video?: { src: string; poster: string };
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  const play = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    // Set muted in code right before playing: browsers block unmuted
    // playback and React does not reliably set the muted attribute.
    video.muted = true;
    video
      .play()
      .catch((err) => console.error("[ProjectCard] play() failed:", err));
  };
  const rewind = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <a
      href={href}
      onMouseEnter={play}
      onMouseLeave={rewind}
      className={`group flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-white/20 ${className ?? ""}`}
    >
      {video && !failed ? (
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
          className="aspect-[16/10] w-full rounded-lg border border-line object-cover"
        />
      ) : (
        <Placeholder className="rounded-lg border border-line" />
      )}
      <span className="mt-5 font-mono text-[13px] text-accent">
        {number} · {category}
      </span>
      <h2 className="type-h3 mt-4">{title}</h2>
      <p className="type-body mt-2 flex-1">{description}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {tags.map((tech) => (
          <li
            key={tech}
            className="rounded-md border border-line px-2 py-0.5 font-mono text-[13px] text-secondary"
          >
            {tech}
          </li>
        ))}
      </ul>
    </a>
  );
}
