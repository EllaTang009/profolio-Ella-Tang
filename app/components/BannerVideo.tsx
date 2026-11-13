"use client";

import { useEffect, useRef, useState } from "react";

// Dark gradient stand-in shown when a video file is missing or fails to
// load, so the media area never renders a broken player.
export function Placeholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`aspect-[16/10] w-full bg-[radial-gradient(ellipse_at_top,rgba(124,127,255,0.15),transparent_65%),linear-gradient(180deg,#141519,#0d0e11)] ${className ?? ""}`}
    />
  );
}

// Banner video for the project detail page: muted autoplay + loop, with
// the reduced-motion preference respected by pausing on mount. Card
// hover behavior lives in ProjectCard.
export default function BannerVideo({
  src,
  poster,
  label,
  className,
}: {
  src?: string;
  poster?: string;
  label?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  if (failed || !src) {
    return <Placeholder className={className} />;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      autoPlay
      aria-label={label}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
