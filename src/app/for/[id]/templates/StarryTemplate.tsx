"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { MomentData } from "../types";

const STARS = Array.from({ length: 110 }, (_, i) => ({
  id: i,
  x:
    Math.round(
      ((((i * 7.3 + Math.sin(i * 2.1) * 22) % 100) + 100) % 100) * 10,
    ) / 10,
  y:
    Math.round(
      ((((i * 5.9 + Math.cos(i * 1.7) * 18) % 100) + 100) % 100) * 10,
    ) / 10,
  size: 0.8 + (i % 4) * 0.55,
  delay: (i * 0.23) % 4,
  duration: 1.6 + (i % 6) * 0.35,
  opacity: 0.3 + (i % 5) * 0.12,
}));

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function StarryPhotoGrid({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  const goldFrame: React.CSSProperties = {
    border: "1.5px solid rgba(201, 168, 76, 0.55)",
    boxShadow: "0 0 20px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.6)",
  };

  if (photos.length === 1) {
    return (
      <div className="flex justify-center">
        <div
          className="relative w-[210px] rounded-xl overflow-hidden"
          style={{ aspectRatio: "3/4", ...goldFrame }}
        >
          <Image
            loading="eager"
            src={photos[0]}
            alt="Photo 1"
            fill
            className="object-cover"
            sizes="210px"
          />
        </div>
      </div>
    );
  }

  if (photos.length <= 3) {
    return (
      <div className="flex gap-3 justify-center items-end">
        {photos.map((url, i) => {
          const tilts = [-2, 1.5, -1.8];
          return (
            <div
              key={i}
              className="relative flex-1 rounded-xl overflow-hidden"
              style={{
                aspectRatio: "3/4",
                transform: `rotate(${tilts[i]}deg)`,
                ...goldFrame,
              }}
            >
              <Image
                src={url}
                loading="eager"
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 155px"
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (photos.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden"
            style={{ aspectRatio: "4/3", ...goldFrame }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 45vw, 195px"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5 photos: 3 + 2
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 3).map((url, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden"
            style={{ aspectRatio: "2/3", ...goldFrame }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 30vw, 135px"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-10">
        {photos.slice(3).map((url, i) => (
          <div
            key={i + 3}
            className="relative rounded-xl overflow-hidden"
            style={{ aspectRatio: "4/3", ...goldFrame }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 4}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 38vw, 170px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type Controller = {
  togglePlay: () => void;
  addListener: (event: string, cb: () => void) => void;
  destroy?: () => void;
};

export default function StarryTemplate({ data }: { data: MomentData }) {
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
        background:
          "radial-gradient(ellipse at 30% 20%, #1a1040 0%, #0b0f2e 40%, #050816 100%)",
      }}
    >
      {/* Stars field */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none">
          {STARS.map((s) => (
            <span
              key={s.id}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                borderRadius: "50%",
                background: "#EAD8A4",
                opacity: s.opacity,
                animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Music modal */}
      {showModal && data.music && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(3, 4, 18, 0.88)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="w-full max-w-sm flex flex-col items-center gap-5 rounded-3xl p-8"
            style={{
              background:
                "linear-gradient(160deg, rgba(26,16,64,0.95) 0%, rgba(11,15,46,0.98) 100%)",
              border: "1px solid rgba(201,168,76,0.4)",
              boxShadow:
                "0 0 80px rgba(201,168,76,0.12), 0 24px 60px rgba(0,0,0,0.7)",
              animation: "starFadeUp 0.6s ease both",
            }}
          >
            {/* Star cluster decoration */}
            <p className="text-[#C9A84C] text-xl tracking-[0.6em]">✦ ✧ ✦</p>

            {data.music.album_image && (
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "1.5px solid rgba(201,168,76,0.4)",
                  boxShadow:
                    "0 0 40px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.7)",
                }}
              >
                <Image
                  src={data.music.album_image}
                  loading="eager"
                  alt={data.music.name || "Album"}
                  width={110}
                  height={110}
                  className="rounded-2xl"
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-[#C9A84C]/60 text-[11px] tracking-[0.4em] uppercase mb-2">
                a song for you
              </p>
              <p
                className="text-[#EAD8A4] text-xl font-light"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                }}
              >
                {data.music.name}
              </p>
              <p className="text-[#C9A84C]/70 text-sm mt-1">
                by {data.music.artist_name}
              </p>
            </div>

            <button
              onClick={() => {
                setAutoplay(true);
                setDismissed(true);
              }}
              className="w-full py-3 rounded-2xl font-medium tracking-wide transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
                color: "#0B0F2E",
                boxShadow: "0 4px 24px rgba(201,168,76,0.3)",
              }}
            >
              Play for me ✦
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-[#C9A84C]/40 text-xs tracking-wider hover:text-[#C9A84C]/70 transition-colors"
            >
              I&apos;ll play it myself later
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
        style={{ opacity: isClient ? 1 : 0, transition: "opacity 1.6s ease" }}
      >
        {/* Eyebrow */}
        <p
          className="text-[#C9A84C]/60 text-[11px] tracking-[0.55em] uppercase mb-4"
          style={{ animation: "starFadeUp 1s ease 0.3s both" }}
        >
          written in the stars
        </p>

        {/* Constellation divider */}
        <div
          className="flex items-center gap-2 mb-6"
          style={{ animation: "starFadeUp 1s ease 0.4s both" }}
        >
          <div
            style={{
              height: "1px",
              width: "50px",
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.5))",
            }}
          />
          <span className="text-[#C9A84C]/70 text-xs">✦</span>
          <span className="text-[#C9A84C] text-sm">✧</span>
          <span className="text-[#C9A84C]/70 text-xs">✦</span>
          <div
            style={{
              height: "1px",
              width: "50px",
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.5))",
            }}
          />
        </div>

        {/* Occasion */}
        <h1
          className="text-[clamp(2.4rem,9vw,4.5rem)] text-center font-medium mb-3 leading-tight"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#EAD8A4",
            textShadow: "0 0 60px rgba(201,168,76,0.35)",
            letterSpacing: "0.04em",
            animation: "starFadeUp 1s ease 0.5s both",
          }}
        >
          {data.occasion || "A Love Letter"}
        </h1>

        {data.headline && (
          <h2
            className="text-[#C9A84C]/70 text-xl text-center mb-8 font-light italic"
            style={{
              fontFamily: "var(--font-playfair)",
              animation: "starFadeUp 1s ease 0.7s both",
            }}
          >
            &ldquo;{data.headline}&rdquo;
          </h2>
        )}

        {/* Gold divider */}
        <div
          className="flex items-center gap-3 mb-8"
          style={{ animation: "starFadeUp 1s ease 0.8s both" }}
        >
          <div
            style={{
              height: "1px",
              width: "60px",
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.6))",
            }}
          />
          <span className="text-[#C9A84C]/80">✦</span>
          <div
            style={{
              height: "1px",
              width: "60px",
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.6))",
            }}
          />
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div
            className="w-full mb-8"
            style={{ animation: "starFadeUp 1s ease 0.9s both" }}
          >
            <StarryPhotoGrid photos={photos} />
          </div>
        )}

        {/* Message card */}
        <div
          className="w-full rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(26,16,64,0.7) 0%, rgba(11,15,46,0.8) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(201,168,76,0.25)",
            boxShadow:
              "0 0 40px rgba(201,168,76,0.06), inset 0 0 60px rgba(201,168,76,0.02)",
            animation:
              "starFadeUp 1s ease 1s both, starGlow 6s ease-in-out 2s infinite",
          }}
        >
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle at 0% 0%, rgba(201,168,76,0.15), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 pointer-events-none"
            style={{
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle at 100% 100%, rgba(201,168,76,0.15), transparent 70%)",
            }}
          />

          <p
            className="relative whitespace-pre-line text-lg leading-[1.9]"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#EAD8A4",
              fontStyle: "italic",
            }}
          >
            {data.message}
          </p>

          {data.sender && (
            <p
              className="relative text-right mt-8 font-medium"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#C9A84C",
                fontSize: "1.25rem",
                fontStyle: "italic",
              }}
            >
              — {data.sender}
            </p>
          )}
        </div>

        {/* Music player */}
        {showPlayer && (
          <div
            className="w-full flex flex-col items-center gap-4"
            style={{ animation: "starFadeUp 0.8s ease both" }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background: "rgba(201,168,76,0.35)",
                }}
              />
              <p className="text-[#C9A84C]/60 text-[11px] tracking-[0.35em] uppercase">
                a song for you
              </p>
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background: "rgba(201,168,76,0.35)",
                }}
              />
            </div>
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(201,168,76,0.12)",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>
        )}

        <p
          className="mt-14 text-[11px] tracking-[0.4em] uppercase"
          style={{
            color: "rgba(201,168,76,0.25)",
            animation: "starFadeUp 1s ease 1.5s both",
          }}
        >
          made with ♡ on 2usforever.com
        </p>
      </div>

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: var(--base, 0.3); transform: scale(0.8); }
          50%       { opacity: 1; transform: scale(1.4); }
        }
        @keyframes starFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starGlow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(201,168,76,0.06), inset 0 0 60px rgba(201,168,76,0.02);
            border-color: rgba(201,168,76,0.25);
          }
          50% {
            box-shadow: 0 0 70px rgba(201,168,76,0.18), inset 0 0 80px rgba(201,168,76,0.06);
            border-color: rgba(201,168,76,0.45);
          }
        }
      `}</style>
    </div>
  );
}
