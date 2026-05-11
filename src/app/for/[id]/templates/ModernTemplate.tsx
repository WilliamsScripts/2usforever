"use client";

import { useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { MomentData } from "../types";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function PhotoStrip({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className="flex justify-center">
        <div
          className="relative w-64 rounded-2xl overflow-hidden shadow-md"
          style={{ aspectRatio: "3/4" }}
        >
          <Image
            src={photos[0]}
            alt="Photo 1"
            fill
            loading="eager"
            className="object-cover"
            sizes="256px"
          />
        </div>
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="flex gap-3">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative flex-1 rounded-xl overflow-hidden shadow-sm"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              loading="eager"
              className="object-cover"
              sizes="(max-width: 640px) 45vw, 200px"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3–5 photos: horizontal scroll strip
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
      {photos.map((url, i) => (
        <div
          key={i}
          className="relative shrink-0 rounded-xl overflow-hidden shadow-sm"
          style={{ width: "148px", aspectRatio: "3/4" }}
        >
          <Image
            src={url}
            alt={`Photo ${i + 1}`}
            fill
            loading="eager"
            className="object-cover"
            sizes="148px"
          />
        </div>
      ))}
    </div>
  );
}

type Controller = {
  togglePlay: () => void;
  addListener: (event: string, cb: () => void) => void;
  destroy?: () => void;
};

export default function ModernTemplate({ data }: { data: MomentData }) {
  const isClient = useIsClient();
  const photos = data.photos ?? [];
  const hasMusic = !!data.music?.track_id;

  const controllerRef = useRef<Controller | null>(null);

  useEffect(() => {
    if (!isClient || !data.music?.track_id) return;

    const uri = `spotify:track:${data.music.track_id}`;
    type SpotifyAPI = {
      createController: (
        el: HTMLElement,
        opts: object,
        cb: (c: typeof controllerRef.current) => void,
      ) => void;
    };
    const win = window as typeof window & {
      SpotifyIframeApi?: SpotifyAPI;
      onSpotifyIframeApiReady?: (api: SpotifyAPI) => void;
    };

    function init(api: SpotifyAPI) {
      const el = document.getElementById("spotify-embed-iframe");
      if (!el) return;
      api.createController(
        el,
        { uri, width: "100%", height: 152 },
        (controller) => {
          controllerRef.current = controller;
        },
      );
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
    };
  }, [isClient, data.music?.track_id]);

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F2" }}>
      {/* Mobile floating Spotify button — always visible when there's music */}
      {hasMusic && isClient && data.music?.track_id && (
        <a
          href={`https://open.spotify.com/track/${data.music.track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden fixed bottom-6 left-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-semibold text-white"
          style={{
            transform: "translateX(-50%)",
            background: "#1DB954",
            boxShadow: "0 4px 28px rgba(29, 185, 84, 0.45)",
            animation: "fadeUp 0.6s ease both",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Listen on Spotify
        </a>
      )}

      <div
        className="max-w-lg mx-auto px-6 py-16 flex flex-col"
        style={{ animation: "fadeIn 0.8s ease both" }}
      >
        {/* Top rule */}
        <div className="flex items-center gap-4 mb-14">
          <div className="h-[2px] flex-1 bg-[#B8435A]" />
          <span className="text-[#B8435A] text-[10px] tracking-[0.5em] uppercase font-semibold">
            with love
          </span>
          <div className="h-[2px] flex-1 bg-[#B8435A]" />
        </div>

        {/* Occasion */}
        <h1
          className="text-[clamp(2.8rem,10vw,5rem)] font-bold text-[#1A0810] leading-[0.95] mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {data.occasion || "A Love Letter"}
        </h1>

        {data.headline && (
          <p className="text-lg text-[#B8435A] mb-8 font-light tracking-wide">
            {data.headline}
          </p>
        )}

        {/* Thin divider */}
        <div className="h-px bg-[rgba(184,67,90,0.15)] mb-10" />

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-10">
            <PhotoStrip photos={photos} />
          </div>
        )}

        {/* Message card */}
        <div
          className="bg-white rounded-2xl p-8 mb-8 shadow-sm"
          style={{
            borderLeft: "3px solid #B8435A",
            boxShadow: "0 2px 20px rgba(184,67,90,0.06)",
          }}
        >
          <p
            className="text-[#1A0810] text-lg leading-[1.8] whitespace-pre-line"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {data.message}
          </p>
          {data.sender && (
            <p className="text-right text-[#B8435A] mt-6 font-semibold tracking-wide">
              — {data.sender}
            </p>
          )}
        </div>

        {/* Music player */}
        {hasMusic && (
          <div className="mb-10">
            {data.music?.name && (
              <div className="flex items-center gap-3 mb-3">
                {data.music.album_image && (
                  <Image
                    src={data.music.album_image}
                    alt={data.music.name}
                    width={36}
                    height={36}
                    loading="eager"
                    className="rounded-lg shrink-0"
                  />
                )}
                <div>
                  <p className="text-[11px] text-[#A88090] tracking-[0.25em] uppercase">
                    A song for you
                  </p>
                  <p className="text-sm font-medium text-[#1A0810] truncate">
                    {data.music.name}
                  </p>
                </div>
              </div>
            )}
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(184,67,90,0.08)",
                width: "100%",
                minHeight: "152px",
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-4">
          <div className="h-px flex-1 bg-[rgba(184,67,90,0.12)]" />
          <p className="text-[#C0A0A8] text-[10px] tracking-[0.4em] uppercase shrink-0">
            made with ♡ on 2usforever.com
          </p>
          <div className="h-px flex-1 bg-[rgba(184,67,90,0.12)]" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
