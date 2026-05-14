"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import type { MomentData } from "@/types/moment";

// ── Star field: mix of warm-white and gold, with a few "giant" featured stars ──
const STARS = Array.from({ length: 125 }, (_, i) => ({
  id: i,
  x:
    Math.round(
      ((((i * 7.3 + Math.sin(i * 2.1) * 22) % 100) + 100) % 100) * 10,
    ) / 10,
  y:
    Math.round(
      ((((i * 5.9 + Math.cos(i * 1.7) * 18) % 100) + 100) % 100) * 10,
    ) / 10,
  size: i % 13 === 0 ? 3.8 : i % 5 === 0 ? 2.2 : 0.9 + (i % 4) * 0.5,
  isGold: i % 7 === 0,
  isLarge: i % 13 === 0,
  twinkleDuration: 1.8 + (i % 7) * 0.45,
  twinkleDelay: (i * 0.24) % 5,
  driftDuration: 32 + (i % 12) * 3.2,
  driftDelay: (i * 1.9) % 22,
}));

// ── Stardust — tiny particles that drift down like cosmic snow ──
const STARDUST = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 6.3 + Math.sin(i * 2.5) * 28) % 100) * 10) / 10,
  duration: 24 + (i % 8) * 3.5,
  delay: (i * 2.3) % 24,
  size: 1 + (i % 3) * 0.55,
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
    border: "1.5px solid rgba(220,175,100,0.65)",
    boxShadow:
      "0 0 36px rgba(201,168,76,0.28), 0 14px 52px rgba(0,0,0,0.75), inset 0 0 24px rgba(200,150,60,0.07)",
    borderRadius: "14px",
    overflow: "hidden",
  };

  if (photos.length === 1) {
    return (
      <div
        className="flex justify-center"
        style={{ animation: "fadeSlideUp 1s ease 0.6s both" }}
      >
        <div
          className="relative w-[210px]"
          style={{ aspectRatio: "3/4", ...goldFrame }}
        >
          <Image
            loading="eager"
            src={photos[0]}
            alt="Photo 1"
            fill
            className="object-contain"
            sizes="210px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 65%, rgba(7,0,18,0.35) 100%)",
            }}
          />
        </div>
      </div>
    );
  }

  if (photos.length <= 3) {
    const tilts = [-2, 1.5, -1.8];
    return (
      <div
        className="flex gap-3 justify-center items-end"
        style={{ animation: "fadeSlideUp 1s ease 0.6s both" }}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative flex-1"
            style={{
              aspectRatio: "3/4",
              transform: `rotate(${tilts[i]}deg)`,
              animation: `fadeSlideUp 1s ease ${0.55 + i * 0.12}s both`,
              ...goldFrame,
            }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 33vw, 155px"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 65%, rgba(7,0,18,0.35) 100%)",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (photos.length === 4) {
    return (
      <div
        className="grid grid-cols-2 gap-3"
        style={{ animation: "fadeSlideUp 1s ease 0.6s both" }}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative"
            style={{
              aspectRatio: "4/3",
              ...goldFrame,
              animation: `fadeSlideUp 0.9s ease ${0.5 + i * 0.1}s both`,
            }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 45vw, 195px"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5 photos: 3 + 2
  return (
    <div
      className="flex flex-col gap-3"
      style={{ animation: "fadeSlideUp 1s ease 0.6s both" }}
    >
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 3).map((url, i) => (
          <div
            key={i}
            className="relative"
            style={{ aspectRatio: "2/3", ...goldFrame }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 30vw, 135px"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-10">
        {photos.slice(3).map((url, i) => (
          <div
            key={i + 3}
            className="relative"
            style={{ aspectRatio: "4/3", ...goldFrame }}
          >
            <Image
              src={url}
              loading="eager"
              alt={`Photo ${i + 4}`}
              fill
              className="object-contain"
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
      style={{ background: "#070012" }}
    >
      {/* ── Nebula: five breathing color clouds ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Violet — center-left, dominant */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "80vw",
            height: "70vh",
            background:
              "radial-gradient(ellipse at center, rgba(110,35,160,0.32) 0%, rgba(80,20,120,0.14) 50%, transparent 75%)",
            filter: "blur(72px)",
            animation: "nebulaBreath1 26s ease-in-out infinite",
          }}
        />
        {/* Magenta — upper right */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "70vw",
            height: "65vh",
            background:
              "radial-gradient(ellipse at center, rgba(180,40,110,0.22) 0%, rgba(140,20,80,0.1) 50%, transparent 75%)",
            filter: "blur(80px)",
            animation: "nebulaBreath2 32s ease-in-out 8s infinite",
          }}
        />
        {/* Deep indigo — lower left */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-10%",
            width: "65vw",
            height: "60vh",
            background:
              "radial-gradient(ellipse at center, rgba(50,20,140,0.25) 0%, rgba(30,10,100,0.1) 50%, transparent 75%)",
            filter: "blur(65px)",
            animation: "nebulaBreath3 22s ease-in-out 14s infinite",
          }}
        />
        {/* Amber — stellar nursery warmth, top center */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "30%",
            width: "55vw",
            height: "40vh",
            background:
              "radial-gradient(ellipse at center, rgba(200,120,40,0.13) 0%, rgba(160,80,20,0.06) 55%, transparent 80%)",
            filter: "blur(60px)",
            animation: "nebulaBreath1 35s ease-in-out 4s infinite",
          }}
        />
        {/* Rose — bottom right warmth */}
        <div
          style={{
            position: "absolute",
            bottom: "-5%",
            right: "5%",
            width: "60vw",
            height: "45vh",
            background:
              "radial-gradient(ellipse at center, rgba(160,50,100,0.16) 0%, rgba(120,30,80,0.07) 55%, transparent 80%)",
            filter: "blur(70px)",
            animation: "nebulaBreath2 28s ease-in-out 18s infinite",
          }}
        />
      </div>

      {/* ── Deep-space vignette ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,0,15,0.85) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Ghost constellation lines ── */}
      {isClient && (
        <svg
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
            opacity: 0.18,
            animation: "constellationPulse 14s ease-in-out infinite",
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <line
            x1="8"
            y1="28"
            x2="20"
            y2="14"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="20"
            y1="14"
            x2="38"
            y2="20"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="38"
            y1="20"
            x2="52"
            y2="8"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="52"
            y1="8"
            x2="68"
            y2="16"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="68"
            y1="16"
            x2="82"
            y2="10"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="82"
            y1="10"
            x2="93"
            y2="22"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.12"
          />
          <line
            x1="20"
            y1="14"
            x2="28"
            y2="34"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.08"
          />
          <line
            x1="52"
            y1="8"
            x2="58"
            y2="28"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.08"
          />
          <line
            x1="68"
            y1="16"
            x2="72"
            y2="36"
            stroke="rgba(220,175,100,1)"
            strokeWidth="0.08"
          />
          <circle cx="8" cy="28" r="0.55" fill="rgba(220,175,100,1)" />
          <circle cx="20" cy="14" r="0.9" fill="rgba(220,175,100,1)" />
          <circle cx="38" cy="20" r="0.65" fill="rgba(220,175,100,1)" />
          <circle cx="52" cy="8" r="1.1" fill="rgba(220,175,100,1)" />
          <circle cx="68" cy="16" r="0.75" fill="rgba(220,175,100,1)" />
          <circle cx="82" cy="10" r="0.55" fill="rgba(220,175,100,1)" />
          <circle cx="93" cy="22" r="0.45" fill="rgba(220,175,100,1)" />
          <circle cx="28" cy="34" r="0.4" fill="rgba(220,175,100,1)" />
          <circle cx="58" cy="28" r="0.45" fill="rgba(220,175,100,1)" />
          <circle cx="72" cy="36" r="0.5" fill="rgba(220,175,100,1)" />
        </svg>
      )}

      {/* ── Star field ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {STARS.map((s) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                borderRadius: "50%",
                background: s.isGold
                  ? "radial-gradient(circle, rgba(230,195,120,0.95) 0%, rgba(200,160,70,0.4) 60%, transparent 100%)"
                  : s.isLarge
                    ? "radial-gradient(circle, #FFFFFF 0%, rgba(220,210,240,0.7) 50%, transparent 100%)"
                    : "rgba(235,225,215,0.8)",
                boxShadow: s.isLarge
                  ? `0 0 ${s.size * 5}px ${s.isGold ? "rgba(220,175,80,0.65)" : "rgba(200,190,255,0.45)"}`
                  : s.isGold
                    ? `0 0 ${s.size * 3}px rgba(220,175,80,0.4)`
                    : "none",
                animation: `starTwinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite, starDrift ${s.driftDuration}s ease-in-out ${s.driftDelay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Stardust: falling cosmic snow ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {STARDUST.map((d) => (
            <div
              key={d.id}
              style={{
                position: "absolute",
                top: "-3%",
                left: `${d.left}%`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(230,200,140,0.9) 0%, rgba(200,160,80,0.4) 60%, transparent 100%)",
                opacity: 0,
                animation: `stardustFall ${d.duration}s ease-in ${d.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Music modal ── */}
      {showModal && data.music && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(4,0,14,0.92)",
            backdropFilter: "blur(22px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(110,35,160,0.22) 0%, transparent 70%)",
            }}
          />

          <div
            className="w-full max-w-sm flex flex-col items-center gap-6 rounded-3xl p-8 relative"
            style={{
              background:
                "linear-gradient(160deg, rgba(22,8,50,0.97) 0%, rgba(12,4,32,0.99) 100%)",
              border: "1px solid rgba(201,168,76,0.35)",
              boxShadow:
                "0 0 100px rgba(110,35,160,0.2), 0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div style={{ animation: "floatGently 7s ease-in-out infinite" }}>
              <p
                style={{
                  color: "#C9A84C",
                  fontSize: "1rem",
                  letterSpacing: "0.65em",
                  textShadow: "0 0 20px rgba(201,168,76,0.6)",
                }}
              >
                ✦ ✧ ✦
              </p>
            </div>

            {data.music.album_image && (
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1.5px solid rgba(201,168,76,0.45)",
                  boxShadow:
                    "0 0 50px rgba(110,35,160,0.35), 0 0 30px rgba(201,168,76,0.2), 0 10px 40px rgba(0,0,0,0.7)",
                  animation: "nebulaBreath1 5s ease-in-out infinite",
                }}
              >
                <Image
                  src={data.music.album_image}
                  loading="eager"
                  alt={data.music.name || "Album"}
                  width={114}
                  height={114}
                  className="block"
                />
              </div>
            )}

            <div className="text-center">
              <p
                style={{
                  color: "rgba(201,168,76,0.55)",
                  fontSize: "10px",
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                a song for you
              </p>
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  color: "#EAD8A4",
                  fontSize: "1.4rem",
                  lineHeight: 1.3,
                  textShadow: "0 0 30px rgba(201,168,76,0.4)",
                }}
              >
                {data.music.name}
              </p>
              <p
                style={{
                  color: "rgba(201,168,76,0.65)",
                  fontSize: "0.9rem",
                  marginTop: "6px",
                }}
              >
                by {data.music.artist_name}
              </p>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent)",
              }}
            />

            <button
              onClick={() => {
                setAutoplay(true);
                setDismissed(true);
              }}
              className="w-full py-3.5 rounded-2xl transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
                color: "#07000F",
                boxShadow:
                  "0 6px 30px rgba(201,168,76,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              Play for me ✦
            </button>

            <button
              onClick={() => setDismissed(true)}
              style={{
                color: "rgba(201,168,76,0.35)",
                fontSize: "11px",
                letterSpacing: "0.3em",
              }}
              className="hover:opacity-70 transition-opacity"
            >
              I&apos;ll play it myself later
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Spotify button ── */}
      {dismissed && hasMusic && data.music?.track_id && (
        <a
          href={`https://open.spotify.com/track/${data.music.track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden fixed bottom-6 left-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full text-white"
          style={{
            transform: "translateX(-50%)",
            background: "#1DB954",
            boxShadow: "0 4px 28px rgba(29,185,84,0.45)",
            fontSize: "10px",
            fontWeight: 600,
            animation: "fadeSlideUp 0.6s ease both",
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

      {/* ── Main content ── */}
      <div
        className="relative z-10 max-w-xl mx-auto px-6 py-16 flex flex-col items-center min-h-screen justify-center"
        style={{ opacity: isClient ? 1 : 0, transition: "opacity 2s ease" }}
      >
        {/* Eyebrow */}
        <p
          style={{
            color: "rgba(201,168,76,0.55)",
            fontSize: "11px",
            letterSpacing: "0.6em",
            textTransform: "uppercase",
            marginBottom: "18px",
            animation: "fadeSlideUp 1.2s ease 0.25s both",
          }}
        >
          written in the stars
        </p>

        {/* Constellation divider — top */}
        <div
          className="flex items-center gap-3 mb-8"
          style={{ animation: "fadeSlideUp 1.1s ease 0.4s both" }}
        >
          <div
            style={{
              height: "1px",
              width: "60px",
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.55))",
            }}
          />
          <span
            style={{
              color: "rgba(201,168,76,0.6)",
              fontSize: "10px",
              animation: "floatGently 8s ease-in-out 1s infinite",
            }}
          >
            ✦
          </span>
          <span
            style={{
              color: "#C9A84C",
              fontSize: "14px",
              textShadow: "0 0 16px rgba(201,168,76,0.7)",
              animation: "floatGently 6s ease-in-out infinite",
            }}
          >
            ✧
          </span>
          <span
            style={{
              color: "rgba(201,168,76,0.6)",
              fontSize: "10px",
              animation: "floatGently 8s ease-in-out 2s infinite",
            }}
          >
            ✦
          </span>
          <div
            style={{
              height: "1px",
              width: "60px",
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.55))",
            }}
          />
        </div>

        {/* Occasion / title */}
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.5rem, 9.5vw, 4.8rem)",
            textAlign: "center",
            fontWeight: 500,
            color: "#EAD8A4",
            letterSpacing: "0.04em",
            lineHeight: 1.15,
            marginBottom: "16px",
            textShadow:
              "0 0 60px rgba(201,168,76,0.5), 0 0 120px rgba(110,35,160,0.3)",
            animation:
              "fadeSlideUp 1.3s cubic-bezier(0.16,1,0.3,1) 0.5s both, goldPulse 7s ease-in-out 2.5s infinite",
          }}
        >
          {data.occasion || "A Love Letter"}
        </h1>

        {data.headline && (
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              color: "rgba(201,168,76,0.72)",
              fontSize: "1.2rem",
              textAlign: "center",
              fontWeight: 300,
              lineHeight: 1.55,
              marginBottom: "12px",
              textShadow: "0 0 24px rgba(201,168,76,0.3)",
              animation: "fadeSlideUp 1.1s ease 0.7s both",
            }}
          >
            &ldquo;{data.headline}&rdquo;
          </h2>
        )}

        {/* Constellation divider — below headline */}
        <div
          className="flex items-center gap-3 mb-10"
          style={{ animation: "fadeSlideUp 1s ease 0.8s both" }}
        >
          <div
            style={{
              height: "1px",
              width: "70px",
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.5))",
            }}
          />
          <span
            style={{
              color: "rgba(201,168,76,0.7)",
              fontSize: "12px",
              animation: "floatGently 9s ease-in-out 3s infinite",
            }}
          >
            ✦
          </span>
          <div
            style={{
              height: "1px",
              width: "70px",
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.5))",
            }}
          />
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="w-full mb-10">
            <StarryPhotoGrid photos={photos} />
          </div>
        )}

        {/* Message card */}
        <div
          className="w-full rounded-2xl p-8 mb-10 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(22,8,50,0.72) 0%, rgba(12,4,32,0.82) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(201,168,76,0.28)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03), inset 0 0 60px rgba(110,35,160,0.06)",
            animation:
              "fadeSlideUp 1.1s ease 0.95s both, cardGlow 8s ease-in-out 3s infinite",
          }}
        >
          {/* Corner star-glow accents */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "140px",
              height: "140px",
              background:
                "radial-gradient(circle at 0% 0%, rgba(201,168,76,0.18), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "140px",
              height: "140px",
              background:
                "radial-gradient(circle at 100% 100%, rgba(110,35,160,0.22), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "50%",
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.04), transparent)",
              animation: "shimmerSlide 12s ease-in-out 4s infinite",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />

          {/* Top ornament */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              animation: "floatGently 9s ease-in-out 2s infinite",
            }}
          >
            <span
              style={{
                color: "#C9A84C",
                fontSize: "1rem",
                letterSpacing: "0.5em",
                textShadow: "0 0 18px rgba(201,168,76,0.6)",
              }}
            >
              ✦ ✧ ✦
            </span>
          </div>

          <p
            className="relative whitespace-pre-line"
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              color: "#EAD8A4",
              fontSize: "1.15rem",
              lineHeight: 2,
              textAlign: "center",
              textShadow: "0 1px 20px rgba(0,0,0,0.5)",
            }}
          >
            {data.message}
          </p>

          {data.sender && (
            <>
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, rgba(201,168,76,0.35), transparent)",
                  margin: "28px 0 18px",
                }}
              />
              <p
                className="relative"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  color: "#C9A84C",
                  fontSize: "1.2rem",
                  textAlign: "right",
                  textShadow: "0 0 22px rgba(201,168,76,0.45)",
                }}
              >
                — {data.sender}
              </p>
            </>
          )}

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              animation: "floatGently 9s ease-in-out 4.5s infinite",
            }}
          >
            <span
              style={{
                color: "#C9A84C",
                fontSize: "1rem",
                letterSpacing: "0.5em",
                textShadow: "0 0 18px rgba(201,168,76,0.6)",
              }}
            >
              ✦ ✧ ✦
            </span>
          </div>
        </div>

        {/* Music player */}
        {showPlayer && (
          <div
            className="w-full flex flex-col items-center gap-4 mb-10"
            style={{ animation: "fadeSlideUp 0.8s ease both" }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  height: "1px",
                  width: "44px",
                  background: "rgba(201,168,76,0.3)",
                }}
              />
              <p
                style={{
                  color: "rgba(201,168,76,0.55)",
                  fontSize: "10px",
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                }}
              >
                a song for you
              </p>
              <div
                style={{
                  height: "1px",
                  width: "44px",
                  background: "rgba(201,168,76,0.3)",
                }}
              />
            </div>
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow:
                  "0 0 40px rgba(110,35,160,0.2), 0 0 20px rgba(201,168,76,0.1), 0 8px 32px rgba(0,0,0,0.6)",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>
        )}

        {/* Footer */}
        <p
          style={{
            color: "rgba(201,168,76,0.22)",
            fontSize: "10px",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            marginTop: "6px",
            animation: "fadeSlideUp 1.1s ease 1.5s both",
          }}
        >
          made with ♡ on 2usforever.com
        </p>
      </div>

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2;  transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1.45); }
        }
        @keyframes starDrift {
          0%, 100% { transform: translateY(0px)  translateX(0px); }
          33%      { transform: translateY(-9px)  translateX(4px); }
          66%      { transform: translateY(-4px)  translateX(-5px); }
        }
        @keyframes stardustFall {
          0%   { transform: translateY(0)    translateX(0px);   opacity: 0; }
          10%  { opacity: 0.85; }
          50%  { transform: translateY(52vh) translateX(12px);  opacity: 0.5; }
          88%  { opacity: 0.15; }
          100% { transform: translateY(108vh) translateX(-8px); opacity: 0; }
        }
        @keyframes nebulaBreath1 {
          0%, 100% { transform: scale(1)    translateX(0)   translateY(0);   opacity: 0.65; }
          33%      { transform: scale(1.08) translateX(-5%) translateY(4%);  opacity: 1; }
          66%      { transform: scale(0.96) translateX(4%)  translateY(-3%); opacity: 0.8; }
        }
        @keyframes nebulaBreath2 {
          0%, 100% { transform: scale(1)    translateX(0)   translateY(0);   opacity: 0.55; }
          40%      { transform: scale(1.1)  translateX(6%)  translateY(-7%); opacity: 0.85; }
          70%      { transform: scale(0.92) translateX(-4%) translateY(5%);  opacity: 0.65; }
        }
        @keyframes nebulaBreath3 {
          0%, 100% { transform: scale(1)   translateX(0)  translateY(0);  opacity: 0.5; }
          50%      { transform: scale(1.12) translateX(7%) translateY(-5%); opacity: 0.8; }
        }
        @keyframes constellationPulse {
          0%, 100% { opacity: 0.18; }
          50%      { opacity: 0.32; }
        }
        @keyframes goldPulse {
          0%, 100% { text-shadow: 0 0 60px rgba(201,168,76,0.5),  0 0 120px rgba(110,35,160,0.3); }
          50%      { text-shadow: 0 0 90px rgba(201,168,76,0.85), 0 0 180px rgba(110,35,160,0.5), 0 0 260px rgba(160,50,120,0.2); }
        }
        @keyframes cardGlow {
          0%, 100% { border-color: rgba(201,168,76,0.28); box-shadow: 0 0 0 1px rgba(255,255,255,0.03), inset 0 0 60px rgba(110,35,160,0.06); }
          50%      { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 60px rgba(201,168,76,0.12), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 80px rgba(110,35,160,0.1); }
        }
        @keyframes floatGently {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-20%); }
          100% { transform: translateX(280%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
