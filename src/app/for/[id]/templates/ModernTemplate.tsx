"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import type { MomentData } from "@/types/moment";

// Deterministic star field — no Math.random at render time
const STARS = Array.from({ length: 58 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 4.9 + Math.sin(i * 1.7) * 23) % 100) * 10) / 10,
  top: Math.round(((i * 6.3 + Math.cos(i * 2.1) * 19) % 96) * 10) / 10,
  size: i % 7 === 0 ? 3.2 : i % 3 === 0 ? 2.1 : 1.4,
  twinkleDuration: 2.5 + (i % 6) * 0.7,
  twinkleDelay: (i * 0.45) % 6,
  driftDuration: 22 + (i % 10) * 2.8,
  driftDelay: (i * 1.4) % 16,
}));

// Rare shooting stars — long delays so they feel like a gift
const METEORS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  top: 5 + i * 16,
  duration: 1.2 + i * 0.2,
  delay: 3 + i * 9,
  cycle: 50 + i * 12,
}));

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function PhotoStrip({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  const glow =
    "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(100,130,255,0.18), 0 0 40px rgba(80,100,220,0.1)";

  if (photos.length === 1) {
    return (
      <div
        className="flex justify-center"
        style={{ animation: "fadeSlideUp 1s ease 0.55s both" }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: "240px",
            aspectRatio: "3/4",
            borderRadius: "20px",
            boxShadow: glow,
          }}
        >
          <Image
            src={photos[0]}
            alt="Photo 1"
            fill
            loading="eager"
            className="object-contain"
            sizes="240px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 60%, rgba(3,8,18,0.4) 100%)",
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div
        className="flex gap-3"
        style={{ animation: "fadeSlideUp 1s ease 0.55s both" }}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative flex-1 overflow-hidden"
            style={{
              aspectRatio: "3/4",
              borderRadius: "16px",
              boxShadow: glow,
            }}
          >
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              loading="eager"
              className="object-contain"
              sizes="(max-width: 640px) 45vw, 200px"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 60%, rgba(3,8,18,0.4) 100%)",
                borderRadius: "inherit",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6"
      style={{
        scrollbarWidth: "none",
        animation: "fadeSlideUp 1s ease 0.55s both",
      }}
    >
      {photos.map((url, i) => (
        <div
          key={i}
          className="relative shrink-0 overflow-hidden"
          style={{
            width: "152px",
            aspectRatio: "3/4",
            borderRadius: "16px",
            boxShadow: glow,
            animation: `fadeSlideUp 0.9s ease ${0.5 + i * 0.1}s both`,
          }}
        >
          <Image
            src={url}
            alt={`Photo ${i + 1}`}
            fill
            loading="eager"
            className="object-contain"
            sizes="152px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 60%, rgba(3,8,18,0.45) 100%)",
              borderRadius: "inherit",
            }}
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
        { uri, width: "100%", height: 152 },
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
      style={{ background: "#030812" }}
    >
      {/* ── Aurora background layers ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-25%",
            left: "15%",
            width: "85vw",
            height: "70vh",
            background:
              "radial-gradient(ellipse at center, rgba(55,35,160,0.3) 0%, rgba(40,20,120,0.12) 50%, transparent 75%)",
            filter: "blur(55px)",
            animation: "auroraDrift1 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "-15%",
            width: "75vw",
            height: "65vh",
            background:
              "radial-gradient(ellipse at center, rgba(90,25,140,0.22) 0%, rgba(60,10,100,0.1) 50%, transparent 75%)",
            filter: "blur(70px)",
            animation: "auroraDrift2 28s ease-in-out 6s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0%",
            left: "-10%",
            width: "65vw",
            height: "50vh",
            background:
              "radial-gradient(ellipse at center, rgba(15,60,120,0.2) 0%, rgba(10,40,90,0.08) 50%, transparent 75%)",
            filter: "blur(60px)",
            animation: "auroraDrift3 20s ease-in-out 11s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80vw",
            height: "30vh",
            background:
              "radial-gradient(ellipse at center bottom, rgba(160,100,30,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "auroraDrift1 30s ease-in-out 4s infinite",
          }}
        />
      </div>

      {/* ── Cinematic vignette ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(2,5,15,0.82) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

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
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                borderRadius: "50%",
                background:
                  s.size > 2.5
                    ? "radial-gradient(circle, #FFFFFF 0%, rgba(200,215,255,0.7) 50%, transparent 100%)"
                    : "rgba(200,215,255,0.75)",
                boxShadow:
                  s.size > 2.5
                    ? `0 0 ${s.size * 3}px rgba(180,200,255,0.6)`
                    : "none",
                animation: `starTwinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite, starDrift ${s.driftDuration}s ease-in-out ${s.driftDelay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Shooting stars ── */}
      {isClient && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {METEORS.map((m) => (
            <div
              key={m.id}
              style={{
                position: "absolute",
                top: `${m.top}%`,
                right: "-10%",
                width: "180px",
                height: "1.5px",
                background:
                  "linear-gradient(to left, transparent, rgba(255,255,220,0.9) 40%, rgba(255,255,255,0.6))",
                borderRadius: "2px",
                opacity: 0,
                transform: "rotate(-25deg)",
                transformOrigin: "right center",
                animation: `meteor ${m.duration}s ease-in ${m.delay}s, meteor ${m.duration}s ease-in ${m.delay + m.cycle}s infinite`,
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
            background: "rgba(2,4,16,0.92)",
            backdropFilter: "blur(22px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(55,35,160,0.2) 0%, transparent 70%)",
            }}
          />

          <div
            className="w-full max-w-sm flex flex-col items-center gap-6 rounded-3xl p-8 relative"
            style={{
              background:
                "linear-gradient(160deg, rgba(8,12,36,0.97) 0%, rgba(4,7,22,0.99) 100%)",
              border: "1px solid rgba(100,130,255,0.28)",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.85), 0 0 80px rgba(55,35,160,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {/* Floating diamond ornament */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                animation: "floatGently 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "40px",
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, rgba(255,213,128,0.4))",
                }}
              />
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  background: "#FFD580",
                  transform: "rotate(45deg)",
                  boxShadow: "0 0 14px rgba(255,213,128,0.7)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  maxWidth: "40px",
                  height: "1px",
                  background:
                    "linear-gradient(to left, transparent, rgba(255,213,128,0.4))",
                }}
              />
            </div>

            {data.music.album_image && (
              <div
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 50px rgba(55,35,160,0.4), 0 0 0 1px rgba(100,130,255,0.25), 0 0 30px rgba(80,100,220,0.2)",
                  animation: "auroraPulse 5s ease-in-out infinite",
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
                  color: "rgba(100,130,255,0.5)",
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
                  color: "#EEF2FF",
                  fontSize: "1.5rem",
                  lineHeight: 1.25,
                  textShadow: "0 0 30px rgba(100,130,255,0.4)",
                }}
              >
                {data.music.name}
              </p>
              <p
                style={{
                  color: "rgba(100,130,255,0.55)",
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
                  "linear-gradient(to right, transparent, rgba(255,213,128,0.3), rgba(100,130,255,0.2), transparent)",
              }}
            />

            <button
              onClick={() => {
                setAutoplay(true);
                setDismissed(true);
              }}
              className="w-full py-3.5 rounded-2xl transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FFD580 0%, #C9960A 100%)",
                color: "#030812",
                boxShadow:
                  "0 6px 28px rgba(255,213,128,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
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
                color: "rgba(100,130,255,0.3)",
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
        className="relative max-w-lg mx-auto px-6 py-16 flex flex-col"
        style={{
          zIndex: 10,
          opacity: isClient ? 1 : 0,
          transition: "opacity 2s ease",
        }}
      >
        {/* "with love" header */}
        <div
          className="flex items-center gap-3 mb-14"
          style={{
            animation: "fadeSlideUp 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s both",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(255,213,128,0.45))",
            }}
          />
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#FFD580",
              transform: "rotate(45deg)",
              boxShadow: "0 0 14px rgba(255,213,128,0.7)",
              flexShrink: 0,
              animation: "floatGently 7s ease-in-out infinite",
            }}
          />
          <span
            style={{
              color: "#FFD580",
              fontSize: "10px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            with love
          </span>
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#FFD580",
              transform: "rotate(45deg)",
              boxShadow: "0 0 14px rgba(255,213,128,0.7)",
              flexShrink: 0,
              animation: "floatGently 7s ease-in-out 1s infinite",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(to left, transparent, rgba(255,213,128,0.45))",
            }}
          />
        </div>

        {/* Occasion / title */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(3rem, 11vw, 5.4rem)",
            lineHeight: 1.05,
            letterSpacing: "0.01em",
            color: "#EEF2FF",
            marginBottom: "16px",
            textShadow:
              "0 2px 40px rgba(100,130,255,0.25), 0 0 80px rgba(80,100,200,0.12)",
            animation:
              "fadeSlideUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.35s both, titleGlow 6s ease-in-out 2s infinite",
          }}
        >
          {data.occasion || "A Love Letter"}
        </h1>

        {data.headline && (
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              color: "#FFD580",
              fontSize: "1.4rem",
              fontWeight: 300,
              lineHeight: 1.45,
              marginBottom: "10px",
              textShadow: "0 0 30px rgba(255,213,128,0.35)",
              animation: "fadeSlideUp 1.1s ease 0.5s both",
            }}
          >
            &ldquo;{data.headline}&rdquo;
          </p>
        )}

        {/* Thin divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, rgba(100,130,255,0.3), rgba(255,213,128,0.2), rgba(100,130,255,0.1), transparent)",
            margin: "32px 0 40px",
            animation: "fadeSlideUp 1s ease 0.55s both",
          }}
        />

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-12">
            <PhotoStrip photos={photos} />
          </div>
        )}

        {/* Message card */}
        <div
          className="relative overflow-hidden mb-10"
          style={{
            borderRadius: "20px",
            padding: "36px 32px",
            background: "rgba(255,255,255,0.038)",
            border: "1px solid rgba(100,130,255,0.18)",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 8px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
            animation: "fadeSlideUp 1.1s ease 0.7s both",
          }}
        >
          {/* Left accent bar */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: 0,
              bottom: "16px",
              width: "2.5px",
              background:
                "linear-gradient(to bottom, transparent, #FFD580 30%, rgba(255,213,128,0.4) 70%, transparent)",
              borderRadius: "2px",
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
                "linear-gradient(90deg, transparent, rgba(180,200,255,0.04), transparent)",
              animation: "shimmerSlide 11s ease-in-out 3s infinite",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              color: "#D8E0F8",
              fontSize: "1.25rem",
              lineHeight: 2,
              whiteSpace: "pre-line",
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
                    "linear-gradient(to right, rgba(255,213,128,0.25), rgba(100,130,255,0.2), transparent)",
                  margin: "28px 0 18px",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  color: "#FFD580",
                  fontSize: "1.25rem",
                  fontWeight: 300,
                  textAlign: "right",
                  letterSpacing: "0.02em",
                  textShadow: "0 0 24px rgba(255,213,128,0.4)",
                }}
              >
                — {data.sender}
              </p>
            </>
          )}
        </div>

        {/* Music player */}
        {showPlayer && (
          <div
            className="mb-10"
            style={{ animation: "fadeSlideUp 1.1s ease 0.9s both" }}
          >
            {data.music?.name && (
              <div className="flex items-center gap-4 mb-4">
                {data.music.album_image && (
                  <div
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow:
                        "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(100,130,255,0.2), 0 0 24px rgba(80,100,220,0.15)",
                      flexShrink: 0,
                      animation: "floatGently 7s ease-in-out infinite",
                    }}
                  >
                    <Image
                      src={data.music.album_image}
                      alt={data.music.name}
                      width={44}
                      height={44}
                      loading="eager"
                      className="block"
                    />
                  </div>
                )}
                <div>
                  <p
                    style={{
                      color: "#4A5890",
                      fontSize: "10px",
                      letterSpacing: "0.45em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    a song for you
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontStyle: "italic",
                      color: "#C8D4F8",
                      fontSize: "1.15rem",
                    }}
                  >
                    {data.music.name}
                  </p>
                  {data.music.artist_name && (
                    <p
                      style={{
                        color: "#4A5890",
                        fontSize: "0.8rem",
                        marginTop: "2px",
                      }}
                    >
                      {data.music.artist_name}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div
              id="spotify-embed-iframe"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(100,130,255,0.15)",
                width: "100%",
                minHeight: "152px",
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center gap-4 mt-4"
          style={{ animation: "fadeSlideUp 1.1s ease 1.1s both" }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(100,130,255,0.2))",
            }}
          />
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "rgba(255,213,128,0.5)",
              transform: "rotate(45deg)",
              flexShrink: 0,
              animation: "floatGently 9s ease-in-out 2s infinite",
            }}
          />
          <p
            style={{
              color: "#222840",
              fontSize: "10px",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            made with ♡ on 2usforever.com
          </p>
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "rgba(255,213,128,0.5)",
              transform: "rotate(45deg)",
              flexShrink: 0,
              animation: "floatGently 9s ease-in-out 3s infinite",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(to left, transparent, rgba(100,130,255,0.2))",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes starDrift {
          0%, 100% { transform: translateY(0px)  translateX(0px); }
          33%      { transform: translateY(-8px)  translateX(3px); }
          66%      { transform: translateY(-4px)  translateX(-4px); }
        }
        @keyframes meteor {
          0%   { transform: rotate(-25deg) translateX(0);      opacity: 0; }
          5%   { opacity: 1; }
          100% { transform: rotate(-25deg) translateX(-140vw); opacity: 0; }
        }
        @keyframes auroraDrift1 {
          0%, 100% { transform: translateX(0)   translateY(0)   scale(1);    opacity: 0.7; }
          33%      { transform: translateX(-7%)  translateY(6%)  scale(1.1);  opacity: 1; }
          66%      { transform: translateX(5%)   translateY(-4%) scale(0.95); opacity: 0.8; }
        }
        @keyframes auroraDrift2 {
          0%, 100% { transform: translateX(0)   translateY(0)   scale(1);    opacity: 0.6; }
          40%      { transform: translateX(7%)   translateY(-9%) scale(1.15); opacity: 0.9; }
          70%      { transform: translateX(-5%)  translateY(5%)  scale(0.9);  opacity: 0.7; }
        }
        @keyframes auroraDrift3 {
          0%, 100% { transform: translateX(0)  translateY(0);   opacity: 0.5; }
          50%      { transform: translateX(9%)  translateY(-6%); opacity: 0.8; }
        }
        @keyframes auroraPulse {
          0%, 100% { box-shadow: 0 10px 50px rgba(55,35,160,0.4), 0 0 0 1px rgba(100,130,255,0.25), 0 0 30px rgba(80,100,220,0.2); }
          50%      { box-shadow: 0 10px 60px rgba(55,35,160,0.65), 0 0 0 1px rgba(100,130,255,0.45), 0 0 50px rgba(80,100,220,0.35); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 2px 40px rgba(100,130,255,0.25), 0 0 80px rgba(80,100,200,0.12); }
          50%      { text-shadow: 0 2px 60px rgba(100,130,255,0.5),  0 0 120px rgba(80,100,200,0.28), 0 0 200px rgba(60,80,180,0.15); }
        }
        @keyframes floatGently {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50%      { transform: translateY(-5px) rotate(45deg); }
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
