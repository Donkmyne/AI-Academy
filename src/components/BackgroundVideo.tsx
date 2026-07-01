import { useState } from "react";

export default function BackgroundVideo() {
  const [videoError, setVideoError] = useState(false);

  // Direct video MP4 is fast, supports object-cover, and has no player frame.
  const directVideoUrl = "https://res.cloudinary.com/op9rzptu/video/upload/Untitled_design_pkaqkd.mp4";
  
  // Embed iframe url as a robust fallback
  const iframeEmbedUrl = "https://player.cloudinary.com/embed/?cloud_name=op9rzptu&public_id=Untitled_design_pkaqkd&autoplay=true&loop=true&muted=true&controls=false";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Decorative neon ambient glows for tech/cosmic depth underneath the text */}
      <div className="absolute top-[-10%] left-[5%] w-[50vw] h-[50vw] max-w-[600px] bg-purple-900/10 rounded-full blur-[130px] z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] bg-violet-950/15 rounded-full blur-[150px] z-10" />

      {!videoError ? (
        <video
          src={directVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover select-none"
          onError={() => setVideoError(true)}
        />
      ) : (
        <iframe
          src={iframeEmbedUrl}
          className="w-full h-full border-0 pointer-events-none scale-105 object-cover"
          allow="autoplay; fullscreen"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}


