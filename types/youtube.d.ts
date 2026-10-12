declare namespace YT {
  interface PlayerEvent {
    data: number;
    target: Player;
  }

  class Player {
    constructor(
      element: HTMLElement,
      options: {
        videoId: string;
        host?: string;
        playerVars?: Record<string, number | string>;
        events?: { onStateChange?: (event: PlayerEvent) => void };
      },
    );
    destroy(): void;
  }

  const PlayerState: { ENDED: number };
}

interface Window {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
}
