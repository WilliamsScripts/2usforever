"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { MomentData } from "../types";

const PETAL_COLORS = ["#FFB0C8", "#FFC5D3", "#FFA8BE", "#FFD0DD", "#F9A8BE"];
const PETALS = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 5.7 + Math.sin(i * 1.9) * 18) % 100) * 10) / 10,
  duration: 14 + (i % 8) * 1.6,
  delay: (i * 1.1) % 18,
  size: 9 + (i % 5) * 2.5,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
}));

const HEARTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 8.1 + Math.sin(i * 2.3) * 22) % 100) * 10) / 10,
  duration: 18 + (i % 6) * 2.5,
  delay: (i * 2.1) % 16,
  size: 6 + (i % 4) * 2.5,
}));

const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 4.9 + Math.cos(i * 1.7) * 20) % 100) * 10) / 10,
  top: Math.round((((i * 6.7 + Math.sin(i * 2.1) * 22) % 85) + 5) * 10) / 10,
  duration: 2 + (i % 5) * 0.7,
  delay: (i * 0.6) % 5,
  size: 2 + (i % 3),
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

  const frame = (i: number) => ({
    background: "linear-gradient(145deg, #fffaf5 0%, #fff5ec 100%)",
    padding: "10px 10px 38px",
    boxShadow:
      "0 16px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.6)",
    transform: `rotate(${POLAROID_TILTS[i % POLAROID_TILTS.length]}deg)`,
    animation: `fadeSlideUp 1s ease ${0.55 + i * 0.15}s both`,
  });

  if (photos.length === 1) {
    return (
      <div className="flex justify-center">
        <div style={{ ...frame(0), width: "190px" }}>
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={photos[0]}
              alt="Photo 1"
              loading="eager"
              fill
              className="object-contain"
              sizes="190px"
            />
          </div>
        </div>
      </div>
    );
  }

  if (photos.length <= 3) {
    return (
      <div className="flex gap-5 justify-center items-end">
        {photos.map((url, i) => (
          <div key={i} style={{ ...frame(i), flex: 1 }}>
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                loading="eager"
                className="object-contain"
                sizes="(max-width: 640px) 30vw, 140px"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {photos.map((url, i) => (
        <div key={i} style={{ ...frame(i), width: "calc(50% - 10px)" }}>
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              loading="eager"
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              className="object-contain"
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
      style={{ background: "#060110" }}
    >
      {/* ── Ambient candlelight glow layers ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "75vw",
            height: "65vh",
            background:
              "radial-gradient(ellipse at center, rgba(200,80,100,0.2) 0%, rgba(150,40,70,0.09) 45%, transparent 70%)",
            animation: "ambientBreath 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "-15%",
            width: "55vw",
            height: "55vh",
            background:
              "radial-gradient(ellipse at center, rgba(180,60,90,0.1) 0%, transparent 65%)",
            animation: "ambientBreath 13s ease-in-out 3.5s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "45%",
            right: "-15%",
            width: "55vw",
            height: "55vh",
            background:
              "radial-gradient(ellipse at center, rgba(160,40,80,0.09) 0%, transparent 65%)",
            animation: "ambientBreath 11s ease-in-out 6s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            height: "35vh",
            background:
              "radial-gradient(ellipse at center bottom, rgba(160,60,40,0.09) 0%, transparent 70%)",
            animation: "ambientBreath 16s ease-in-out 2s infinite",
          }}
        />
      </div>

      {/* ── Cinematic vignette ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(4,0,10,0.75) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Falling rose petals ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {PETALS.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                top: "-4%",
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                color: p.color,
                opacity: 0,
                display: "block",
                filter: "blur(0.4px)",
                animation: `petalDrift ${p.duration}s ease-in ${p.delay}s infinite`,
              }}
            >
              ✿
            </span>
          ))}
        </div>
      )}

      {/* ── Rising hearts ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {HEARTS.map((h) => (
            <span
              key={h.id}
              style={{
                position: "absolute",
                bottom: "-4%",
                left: `${h.left}%`,
                fontSize: `${h.size}px`,
                color: "rgba(255,130,155,0.45)",
                opacity: 0,
                display: "block",
                filter: "blur(0.6px)",
                animation: `heartRise ${h.duration}s ease-out ${h.delay}s infinite`,
              }}
            >
              ♡
            </span>
          ))}
        </div>
      )}

      {/* ── Golden sparkles ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {SPARKLES.map((s) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,215,170,0.95) 0%, rgba(255,170,120,0.3) 60%, transparent 100%)",
                opacity: 0,
                animation: `sparkleGlow ${s.duration}s ease-in-out ${s.delay}s infinite`,
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
            background: "rgba(5,0,14,0.9)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(200,80,100,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="w-full max-w-sm flex flex-col items-center gap-6 rounded-3xl p-8 relative"
            style={{
              background:
                "linear-gradient(160deg, rgba(28,8,18,0.97) 0%, rgba(18,4,12,0.99) 100%)",
              border: "1px solid rgba(212,137,159,0.28)",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.85), 0 0 80px rgba(180,60,90,0.15), inset 0 1px 0 rgba(255,200,180,0.08)",
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div style={{ animation: "floatGently 6s ease-in-out infinite" }}>
              <p
                style={{
                  color: "#D4899F",
                  letterSpacing: "0.6em",
                  fontSize: "1rem",
                  textShadow: "0 0 20px rgba(212,137,159,0.5)",
                }}
              >
                ✿ ❀ ✿
              </p>
            </div>

            {data.music.album_image && (
              <div
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 50px rgba(180,60,90,0.45), 0 0 0 1px rgba(212,137,159,0.25)",
                  animation: "ambientBreath 5s ease-in-out 0.5s infinite",
                }}
              >
                <Image
                  loading="eager"
                  src={data.music.album_image}
                  alt={data.music.name || "Album"}
                  width={112}
                  height={112}
                  className="block"
                />
              </div>
            )}

            <div className="text-center">
              <p
                style={{
                  color: "#7A4055",
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
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  color: "#FFF5EC",
                  fontSize: "1.45rem",
                  lineHeight: 1.3,
                  textShadow: "0 0 30px rgba(255,150,170,0.45)",
                }}
              >
                {data.music.name}
              </p>
              <p
                style={{
                  color: "#8A5065",
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
                  "linear-gradient(to right, transparent, rgba(212,137,159,0.35), transparent)",
              }}
            />

            <button
              onClick={() => {
                setAutoplay(true);
                setDismissed(true);
              }}
              className="w-full py-3.5 rounded-2xl transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C8516A 0%, #8B3A62 100%)",
                color: "#FFF5EC",
                boxShadow:
                  "0 6px 28px rgba(200,81,106,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Play for me ✿
            </button>

            <button
              onClick={() => setDismissed(true)}
              style={{
                color: "#4A2035",
                fontSize: "11px",
                letterSpacing: "0.3em",
              }}
              className="hover:opacity-70 transition-opacity"
            >
              I&apos;ll listen later
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
        className="relative max-w-xl mx-auto px-6 py-20 flex flex-col items-center min-h-screen justify-center"
        style={{
          zIndex: 10,
          opacity: isClient ? 1 : 0,
          transition: "opacity 2s ease",
        }}
      >
        {/* Hero header */}
        <div
          className="text-center mb-12"
          style={{
            animation:
              "fadeSlideUp 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              animation: "floatGently 7s ease-in-out infinite",
            }}
          >
            <span
              style={{
                color: "#D4899F",
                letterSpacing: "0.65em",
                fontSize: "1rem",
                display: "block",
                textShadow: "0 0 24px rgba(212,137,159,0.65)",
              }}
            >
              ✿ ❀ ✿
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontSize: "clamp(2.8rem, 8.5vw, 4.6rem)",
              fontWeight: 300,
              color: "#FFF5EC",
              lineHeight: 1.12,
              marginBottom: "20px",
              textShadow:
                "0 0 40px rgba(255,150,170,0.4), 0 2px 24px rgba(0,0,0,0.6)",
              animation: "titleGlow 5.5s ease-in-out 2s infinite",
            }}
          >
            {data.occasion || "A Love Letter"}
          </h1>

          {/* Ornamental divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              justifyContent: "center",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: "64px",
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(212,137,159,0.55))",
              }}
            />
            <span
              style={{
                color: "#C87090",
                fontSize: "20px",
                animation: "floatGently 5.5s ease-in-out 1s infinite",
                textShadow: "0 0 16px rgba(200,112,144,0.6)",
              }}
            >
              ♡
            </span>
            <div
              style={{
                flex: 1,
                maxWidth: "64px",
                height: "1px",
                background:
                  "linear-gradient(to left, transparent, rgba(212,137,159,0.55))",
              }}
            />
          </div>

          {data.headline && (
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                color: "#F0B0A0",
                fontSize: "1.3rem",
                lineHeight: 1.55,
                textShadow: "0 0 22px rgba(240,176,160,0.35)",
              }}
            >
              &ldquo;{data.headline}&rdquo;
            </p>
          )}

          <div
            style={{
              marginTop: "22px",
              animation: "floatGently 9s ease-in-out 3s infinite",
            }}
          >
            <span
              style={{
                color: "#7A4060",
                letterSpacing: "0.5em",
                fontSize: "0.9rem",
                display: "block",
              }}
            >
              ❁ ❀ ❁
            </span>
          </div>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div
            className="w-full mb-12"
            style={{ animation: "fadeSlideUp 1.2s ease 0.65s both" }}
          >
            <PolaroidGrid photos={photos} />
          </div>
        )}

        {/* Message card */}
        <div
          className="w-full mb-10 rounded-3xl relative overflow-hidden"
          style={{
            padding: "36px 32px",
            background:
              "linear-gradient(145deg, rgba(255,248,240,0.065) 0%, rgba(255,235,225,0.045) 100%)",
            border: "1px solid rgba(212,137,159,0.22)",
            boxShadow:
              "0 8px 64px rgba(0,0,0,0.35), inset 0 0 48px rgba(255,200,180,0.025), 0 0 0 1px rgba(255,255,255,0.025)",
            backdropFilter: "blur(14px)",
            animation: "fadeSlideUp 1.2s ease 0.85s both",
          }}
        >
          {/* Moving shimmer stripe */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "45%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,200,180,0.055), transparent)",
              animation: "shimmerSlide 9s ease-in-out 2s infinite",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />

          {/* Corner ornaments */}
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 18,
              color: "rgba(212,137,159,0.3)",
              fontSize: "13px",
            }}
          >
            ✿
          </span>
          <span
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              color: "rgba(212,137,159,0.3)",
              fontSize: "13px",
            }}
          >
            ✿
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 14,
              left: 18,
              color: "rgba(212,137,159,0.3)",
              fontSize: "13px",
            }}
          >
            ✿
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 14,
              right: 18,
              color: "rgba(212,137,159,0.3)",
              fontSize: "13px",
            }}
          >
            ✿
          </span>

          <div
            style={{
              textAlign: "center",
              marginBottom: "22px",
              animation: "floatGently 8s ease-in-out 2s infinite",
            }}
          >
            <span
              style={{
                color: "#C87090",
                fontSize: "24px",
                textShadow: "0 0 24px rgba(200,112,144,0.55)",
              }}
            >
              ♡
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              color: "#FFF5EC",
              fontSize: "1.2rem",
              lineHeight: 2.05,
              whiteSpace: "pre-line",
              textAlign: "center",
              textShadow: "0 1px 20px rgba(0,0,0,0.4)",
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
                    "linear-gradient(to right, transparent, rgba(212,137,159,0.3), transparent)",
                  margin: "28px 0 18px",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  color: "#D4899F",
                  fontSize: "1.15rem",
                  textAlign: "right",
                  textShadow: "0 0 20px rgba(212,137,159,0.35)",
                }}
              >
                — {data.sender}
              </p>
            </>
          )}

          <div
            style={{
              textAlign: "center",
              marginTop: "22px",
              animation: "floatGently 8s ease-in-out 4s infinite",
            }}
          >
            <span
              style={{
                color: "#C87090",
                fontSize: "24px",
                textShadow: "0 0 24px rgba(200,112,144,0.55)",
              }}
            >
              ♡
            </span>
          </div>
        </div>

        {/* Music player */}
        {showPlayer && (
          <div
            className="w-full mb-10"
            style={{ animation: "fadeSlideUp 0.8s ease both" }}
          >
            <p
              style={{
                color: "#6A3050",
                fontSize: "10px",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "14px",
              }}
            >
              ✿ a song for you ✿
            </p>
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow:
                  "0 8px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,137,159,0.15)",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>
        )}

        <p
          style={{
            color: "#3D1528",
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginTop: "18px",
            animation: "fadeSlideUp 1.2s ease 1.3s both",
          }}
        >
          ✾ made with ♡ on 2usforever.com ✾
        </p>
      </div>

      <style>{`
        @keyframes petalDrift {
          0%   { transform: translateY(0)     rotate(0deg)   translateX(0px);   opacity: 0; }
          8%   { opacity: 0.8; }
          30%  { transform: translateY(28vh)  rotate(120deg) translateX(22px); }
          60%  { transform: translateY(62vh)  rotate(240deg) translateX(-16px); opacity: 0.5; }
          88%  { opacity: 0.18; }
          100% { transform: translateY(108vh) rotate(360deg) translateX(10px);  opacity: 0; }
        }
        @keyframes heartRise {
          0%   { transform: translateY(0)     scale(1)   rotate(-6deg); opacity: 0; }
          10%  { opacity: 0.6; }
          50%  { transform: translateY(-44vh) scale(0.9) rotate(6deg);  opacity: 0.35; }
          90%  { opacity: 0.08; }
          100% { transform: translateY(-96vh) scale(0.5) rotate(-8deg); opacity: 0; }
        }
        @keyframes sparkleGlow {
          0%, 100% { opacity: 0;   transform: scale(0.2) rotate(0deg); }
          30%      { opacity: 0.9; transform: scale(1.3) rotate(45deg); }
          55%      { opacity: 0.65; transform: scale(1)  rotate(90deg); }
          75%      { opacity: 0.4; transform: scale(0.7) rotate(120deg); }
        }
        @keyframes ambientBreath {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.09); }
        }
        @keyframes floatGently {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(255,150,170,0.4),  0 2px 24px rgba(0,0,0,0.6); }
          50%      { text-shadow: 0 0 70px rgba(255,150,170,0.72), 0 0 120px rgba(200,80,100,0.28), 0 2px 24px rgba(0,0,0,0.6); }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-20%); }
          100% { transform: translateX(280%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
