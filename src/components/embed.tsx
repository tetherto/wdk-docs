"use client";

import { useState } from "react";

interface EmbedProps {
  url: string;
  title?: string;
}

const ALLOWED_EMBED_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
];

function isAllowedUrl(url: string, allowedHosts?: string[]): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) {
    return !allowedHosts;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (allowedHosts) return allowedHosts.includes(parsed.hostname);
    return true;
  } catch {
    return false;
  }
}

function getVideoType(url: string): 'video/mp4' | 'video/webm' | null {
  const pathname = url.split(/[?#]/, 1)[0].toLowerCase();
  if (pathname.endsWith('.mp4')) return 'video/mp4';
  if (pathname.endsWith('.webm')) return 'video/webm';
  return null;
}

export function Embed({ url, title }: EmbedProps) {
  if (isAllowedUrl(url, ALLOWED_EMBED_HOSTS)) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return <YouTubeEmbed title={title} videoId={videoId} />;
    }
  }

  const videoType = getVideoType(url);
  if (videoType && isAllowedUrl(url)) {
    return (
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg">
        <video controls className="w-full max-h-[480px]" preload="metadata">
          <source src={url} type={videoType} />
        </video>
      </div>
    );
  }

  if (isAllowedUrl(url)) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={url}
          title={title || 'Embedded content'}
          className="absolute inset-0 h-full w-full"
          sandbox="allow-scripts allow-same-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}

function YouTubeEmbed({ title, videoId }: { title?: string; videoId: string }) {
  const [isActivated, setIsActivated] = useState(false);
  const label = title || "Video";

  if (!isActivated) {
    return (
      <button
        type="button"
        onClick={() => setIsActivated(true)}
        aria-label={`Play ${label}`}
        className="group relative aspect-video w-full overflow-hidden rounded-lg border border-fd-border bg-fd-card text-left"
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/95 text-black shadow-lg">
            <span className="ms-0.5 text-lg">▶</span>
          </span>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/embed\/)([^?&]+)/,
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
