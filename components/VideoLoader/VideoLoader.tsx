"use client";

import { useEffect, useRef } from "react";

export default function VideoLoader() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#faf8f5]">
      <video
        ref={videoRef}
        src="/Video Project.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-[280px] h-[280px] object-contain mix-blend-screen"
      />
    </div>
  );
}
