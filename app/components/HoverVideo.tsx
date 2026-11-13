"use client";

import { useEffect, useRef, useState } from "react";

// Dark gradient stand-in shown when a video file is missing or fails
// to load, so cards never render a broken player.
function Placeholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`aspect-[16/10] w-full bg-[radial-gradient(ellipse_at_top,rgba(124,127,255,0.15),transparent_65%),linear-gradient(180deg,#141519,#0d0e11)] ${className ?? ""}`}
    />
  );
}

// Video that plays on hover (like Linear's Now page cards) and falls
// back gracefully on touch devices and for reduced-motion users.
//
// - Desktop: plays on mouse enter; pausing on mouse leave rewinds it.
// - Touch (no hover): plays while scrolled into view; a tap also plays.
// - prefers-reduced-motion: shows only the poster/first frame, never plays.
// - autoPlay mode (project detail banner): muted autoplay + loop, with
//   the same reduced-motion respect.
export default function HoverVideo({
  src,
  poster,
  autoPlay = false,
  label,
  className,
}: {
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  label?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  // Interaction flags are only read inside handlers, so plain refs
  // (initialized once on mount) avoid needless re-renders.
  const reduceMotion = useRef(false);
  const touchOnly = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    touchOnly.current = window.matchMedia("(hover: none)").matches;
    // Banner autoplay still respects the reduced-motion preference.
    if (reduceMotion.current) {
      videoRef.current?.pause();
    }
  }, []);

  // Touch devices with no hover: play while the video is on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (autoPlay || failed || !video) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduceMotion.current || !touchOnly.current) {
          return;
        }
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, failed]);

  // Nudging currentTime forces the browser to paint the first frame,
  // which preload="metadata" alone does not guarantee.
  const showFirstFrame = () => {
    const video = videoRef.current;
    if (video && video.currentTime < 0.01) {
      video.currentTime = 0.001;
    }
  };

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
      preload="metadata"
      autoPlay={autoPlay || undefined}
      aria-label={label}
      onError={() => setFailed(true)}
      onLoadedData={showFirstFrame}
      onMouseEnter={() => {
        if (reduceMotion.current || touchOnly.current) {
          return;
        }
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (reduceMotion.current || touchOnly.current) {
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }}
      onClick={() => {
        // Tap-to-play for touch devices (where mouse events are emulated
        // without hover). Desktop users navigate the card link instead.
        const video = videoRef.current;
        if (!video || reduceMotion.current || !touchOnly.current) {
          return;
        }
        if (video.paused) {
          video.play().catch(() => {});
        }
      }}
      className={className}
    />
  );
}
