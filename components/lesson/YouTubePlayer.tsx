'use client';

import { useEffect, useRef } from 'react';

let apiPromise: Promise<typeof YT> | null = null;

function loadYouTubeApi(): Promise<typeof YT> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function YouTubePlayer({
  videoId,
  title,
  onEnded,
}: {
  videoId: string;
  title: string;
  onEnded?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    let cancelled = false;
    const host = document.createElement('div');
    host.className = 'h-full w-full';
    host.title = title;
    containerRef.current?.appendChild(host);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !host.isConnected) return;
      playerRef.current = new YT.Player(host, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.remove();
    };
  }, [videoId, title]);

  return (
    <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
