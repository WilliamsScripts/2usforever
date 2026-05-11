"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { MomentData } from "../types";

const PETAL_CHARS = ["✿", "❀", "✾", "❁", "✿"];
const PETALS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 5.7 + Math.sin(i * 1.9) * 18) % 100) * 10) / 10,
  duration: 9 + (i % 7) * 1.2,
  delay: (i * 0.9) % 9,
  size: 13 + (i % 5) * 3,
  char: PETAL_CHARS[i % PETAL_CHARS.length],
}));

const POLAROID_TILTS = [-3.5, 2.5, -2, 3, -1.5];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function PolaroidGrid({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className="flex justify-center">
        <div
          className="bg-white p-3 pb-10 shadow-lg"
          style={{
            transform: `rotate(${POLAROID_TILTS[0]}deg)`,
            width: "190px",
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={photos[0]}
              alt="Photo 1"
              loading="eager"
              fill
              className="object-cover"
              sizes="190px"
            />
          </div>
        </div>
      </div>
    );
  }

  if (photos.length <= 3) {
    return (
      <div className="flex gap-3 justify-center items-end">
        {photos.map((url, i) => (
          <div
            key={i}
            className="bg-white p-2 pb-7 shadow-md flex-1"
            style={{ transform: `rotate(${POLAROID_TILTS[i]}deg)` }}
          >
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 640px) 30vw, 140px"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 4–5: wrap into two rows
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {photos.map((url, i) => (
        <div
          key={i}
          className="bg-white p-2 pb-7 shadow-md"
          style={{
            transform: `rotate(${POLAROID_TILTS[i % POLAROID_TILTS.length]}deg)`,
            width: "calc(50% - 8px)",
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              loading="eager"
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 43vw, 180px"
            />
          </div>
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

export default function FloralTemplate({ data }: { data: MomentData }) {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const hasMusic = !!data.music?.track_id;
  const showModal = isClient && hasMusic && !dismissed;
  const showPlayer = dismissed && hasMusic;
  const photos = data.photos ?? [];

  const controllerRef = useRef<Controller | null>(null);

  useEffect(() => {
    if (!showPlayer || !data.music?.track_id) return;

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
        { uri, width: "100%", height: 80 },
        (controller) => {
          controllerRef.current = controller;
          controller?.addListener("ready", () => {
            if (autoplay) controller?.togglePlay();
          });
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
  }, [showPlayer, data.music?.track_id, autoplay]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #FDF5EE 0%, #FEF0F4 100%)",
      }}
    >
      {/* Falling petals */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {PETALS.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                bottom: "-10%",
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                color: "#D4899F",
                opacity: 0,
                animation: `petalFall ${p.duration}s ease-in ${p.delay}s infinite`,
              }}
            >
              {p.char}
            </span>
          ))}
        </div>
      )}

      {/* Music modal */}
      {showModal && data.music && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(80, 20, 40, 0.55)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="w-full max-w-sm flex flex-col items-center gap-5 rounded-3xl p-8"
            style={{
              background: "linear-gradient(160deg, #FFF8F2 0%, #FFF0F5 100%)",
              border: "1.5px solid rgba(212, 137, 159, 0.5)",
              boxShadow: "0 24px 60px rgba(180,60,90,0.25)",
              animation: "petalFadeUp 0.5s ease both",
            }}
          >
            <p className="text-[#D4899F] text-lg tracking-widest">✿ ❀ ✿</p>

            {data.music.album_image && (
              <Image
                loading="eager"
                src={data.music.album_image}
                alt={data.music.name || "Album"}
                width={100}
                height={100}
                className="rounded-xl"
                style={{ boxShadow: "0 6px 24px rgba(180,60,90,0.25)" }}
              />
            )}

            <div className="text-center">
              <p className="text-[#A07085] text-[11px] tracking-[0.4em] uppercase mb-1">
                a song for you
              </p>
              <p
                className="text-[#5C2D3A] text-xl"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                }}
              >
                {data.music.name}
              </p>
              <p className="text-[#A07085] text-sm mt-1">
                by {data.music.artist_name}
              </p>
            </div>

            <button
              onClick={() => {
                setAutoplay(true);
                setDismissed(true);
              }}
              className="w-full py-3 rounded-2xl text-white font-medium tracking-wide transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C8516A 0%, #8B3A62 100%)",
                boxShadow: "0 4px 20px rgba(200,81,106,0.35)",
              }}
            >
              Play for me ✿
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-[#C0A0A8] text-xs tracking-wider hover:text-[#8B3A62] transition-colors"
            >
              I&apos;ll listen later
            </button>
          </div>
        </div>
      )}

      {/* Mobile floating Spotify button — shown after modal dismissed */}
      {dismissed && hasMusic && data.music?.track_id && (
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

      {/* Page content */}
      <div
        className="relative z-10 max-w-xl mx-auto px-6 py-16 flex flex-col items-center min-h-screen justify-center"
        style={{ opacity: isClient ? 1 : 0, transition: "opacity 1.4s ease" }}
      >
        {/* Floral header */}
        <div
          className="text-center mb-10"
          style={{ animation: "petalFadeUp 1s ease 0.2s both" }}
        >
          <p className="text-[#D4899F] text-base tracking-[0.5em] mb-4">
            ✿ ❀ ✿
          </p>
          <h1
            className="text-5xl text-[#5C2D3A] font-light leading-tight mb-3"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            {data.occasion || "A Love Letter"}
          </h1>
          {data.headline && (
            <p
              className="text-[#A07085] text-xl"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
              }}
            >
              &ldquo;{data.headline}&rdquo;
            </p>
          )}
          <p className="text-[#D4899F] text-base tracking-[0.5em] mt-4">
            ❁ ❀ ❁
          </p>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div
            className="w-full mb-8"
            style={{ animation: "petalFadeUp 1s ease 0.5s both" }}
          >
            <PolaroidGrid photos={photos} />
          </div>
        )}

        {/* Message: parchment card */}
        <div
          className="w-full rounded-3xl p-8 mb-8"
          style={{
            background: "rgba(255, 248, 242, 0.85)",
            border: "1.5px solid rgba(212, 137, 159, 0.35)",
            boxShadow: "0 4px 40px rgba(180,60,90,0.08)",
            animation: "petalFadeUp 1s ease 0.7s both",
          }}
        >
          <p className="text-[#D4899F] text-center text-2xl mb-4">✿</p>
          <p
            className="text-[#5C2D3A] text-xl leading-[1.9] whitespace-pre-line text-center"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            {data.message}
          </p>
          {data.sender && (
            <p
              className="text-right text-[#A07085] mt-6"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontSize: "1.2rem",
              }}
            >
              — {data.sender}
            </p>
          )}
          <p className="text-[#D4899F] text-center text-2xl mt-4">✿</p>
        </div>

        {/* Music player */}
        {showPlayer && (
          <div
            className="w-full mb-8"
            style={{ animation: "petalFadeUp 0.6s ease both" }}
          >
            <p className="text-[#D4899F] text-[11px] tracking-[0.4em] uppercase text-center mb-3">
              ✿ a song for you ✿
            </p>
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(180,60,90,0.12)",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>
        )}

        <p className="text-[#D4899F] text-[11px] tracking-[0.35em] uppercase mt-10">
          ✾ made with ♡ on 2usforever.com ✾
        </p>
      </div>

      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(0) rotate(-15deg); opacity: 0; }
          8%   { opacity: 0.65; }
          75%  { opacity: 0.35; }
          100% { transform: translateY(-115vh) rotate(20deg); opacity: 0; }
        }
        @keyframes petalFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
