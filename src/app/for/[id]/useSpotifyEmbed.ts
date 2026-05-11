import { useRef, useEffect } from "react";

type Controller = {
  togglePlay: () => void;
  addListener: (event: string, cb: () => void) => void;
  destroy?: () => void;
};

type SpotifyAPI = {
  createController: (
    el: HTMLElement,
    opts: object,
    cb: (c: Controller | null) => void,
  ) => void;
};

type Win = typeof window & {
  SpotifyIframeApi?: SpotifyAPI;
  onSpotifyIframeApiReady?: (api: SpotifyAPI) => void;
};

export function useSpotifyEmbed({
  elementId,
  trackId,
  autoplay,
  active,
}: {
  elementId: string;
  trackId: string | undefined;
  autoplay: boolean;
  active: boolean;
}) {
  const ref = useRef<Controller | null>(null);

  useEffect(() => {
    if (!active || !trackId) return;

    const uri = `spotify:track:${trackId}`;
    const win = window as Win;

    function init(api: SpotifyAPI) {
      const el = document.getElementById(elementId);
      if (!el) return;
      api.createController(el, { uri, width: "100%", height: 80 }, (c) => {
        ref.current = c;
        c?.addListener("ready", () => {
          if (autoplay) c?.togglePlay();
        });
      });
    }

    if (win.SpotifyIframeApi) {
      init(win.SpotifyIframeApi);
    } else {
      const prev = win.onSpotifyIframeApiReady;
      win.onSpotifyIframeApiReady = (api) => {
        win.SpotifyIframeApi = api;
        prev?.(api);
        init(api);
      };
      if (!document.getElementById("spotify-iframe-api-script")) {
        const s = document.createElement("script");
        s.id = "spotify-iframe-api-script";
        s.src = "https://open.spotify.com/embed/iframe-api/v1";
        s.async = true;
        document.body.appendChild(s);
      }
    }

    return () => {
      ref.current?.destroy?.();
      ref.current = null;
    };
  }, [active, trackId, autoplay, elementId]);

  return ref;
}
