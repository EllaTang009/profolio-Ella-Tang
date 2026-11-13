"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
// - Desktop: plays when the mouse enters the CARD (the wrapper div below,
//   which also contains the card text); leaving rewinds to the start.
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
  containerClassName,
  children,
}: {
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  label?: string;
  className?: string;
  containerClassName?: string;
  children?: ReactNode;
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
    const video = videoRef.current;
    if (!video) {
      return;
    }
    // Browsers decide whether playback is allowed based on the muted
    // property, so enforce it imperatively (not just as an attribute).
    video.muted = true;
    // Banner autoplay still respects the reduced-motion preference.
    if (reduceMotion.current) {
      video.pause();
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

  // play() returns a promise that can reject (e.g. NotAllowedError or a
  // load hiccup); handle it instead of letting it surface as an error.
  const tryPlay = () => {
    videoRef.current?.play().catch(() => {});
  };
  const rewind = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };
  const canHover = () => !reduceMotion.current && !touchOnly.current;

  // Nudging currentTime forces the browser to paint the first frame,
  // which preload alone does not guarantee in every browser.
  const showFirstFrame = () => {
    const video = videoRef.current;
    if (video && video.currentTime < 0.01) {
      video.currentTime = 0.001;
    }
  };

  if (failed || !src) {
    return <Placeholder className={className} />;
  }

  const videoElement = (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      autoPlay={autoPlay || undefined}
      aria-label={label}
      onError={() => setFailed(true)}
      onLoadedData={showFirstFrame}
      className={className}
    />
  );

  // Banner mode: a plain autoplaying video, no hover logic.
  if (autoPlay) {
    return videoElement;
  }

  // Card mode: the wrapper (video + card text) is the hover target, so
  // hovering anywhere on the card plays the video via the ref.
  return (
    <div
      onMouseEnter={() => {
        if (canHover()) {
          tryPlay();
        }
      }}
      onMouseLeave={() => {
        if (canHover()) {
          rewind();
        }
      }}
      onClick={() => {
        // Tap-to-play for touch devices (where mouse events are emulated
        // without hover). Desktop users navigate the card link instead.
        if (touchOnly.current && !reduceMotion.current) {
          const video = videoRef.current;
          if (video?.paused) {
            tryPlay();
          }
        }
      }}
      className={containerClassName}
    >
      {videoElement}
      {children}
    </div>
  );
}
