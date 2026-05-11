import { useRef, useEffect, useCallback } from "react";

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
  active,
}: {
  elementId: string;
  trackId: string | undefined;
  active: boolean;
}) {
  const controllerRef = useRef<Controller | null>(null);
  const pendingPlay = useRef(false);

  useEffect(() => {
    if (!active || !trackId) return;

    const uri = `spotify:track:${trackId}`;
    const win = window as Win;

    function init(api: SpotifyAPI) {
      const el = document.getElementById(elementId);
      if (!el) return;
      api.createController(el, { uri, width: "100%", height: 80 }, (c) => {
        controllerRef.current = c;
        c?.addListener("ready", () => {
          if (pendingPlay.current) {
            c?.togglePlay();
            pendingPlay.current = false;
          }
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
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
      pendingPlay.current = false;
    };
  }, [active, trackId, elementId]);

  // Call this directly inside a user gesture handler (click/tap) so iOS allows playback.
  // If the controller isn't ready yet, pendingPlay ensures it starts once it is.
  const play = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.togglePlay();
    } else {
      pendingPlay.current = true;
    }
  }, []);

  return play;
}
