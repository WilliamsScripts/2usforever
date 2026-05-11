"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { MomentData } from "../types";

const CHARS = ["♡", "♥", "♡", "♥", "♡"];
const COLORS = [
  "#f5a0b5",
  "#f5d6dc",
  "#e8b4bf",
  "#ffc0cb",
  "#ffb6c1",
  "#f08090",
];

const HEARTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: Math.round(((i * 4.3 + Math.sin(i * 1.7) * 14) % 100) * 100) / 100,
  duration: 7 + (i % 8) * 1.3,
  delay: (i * 0.75) % 10,
  size: 12 + (i % 6) * 4,
  char: CHARS[i % CHARS.length],
  color: COLORS[i % COLORS.length],
}));

const TILTS = [-2.5, 1.8, -1.2, 2.1, -0.8];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  const imgBox: React.CSSProperties = {
    background: "rgba(255,240,245,0.05)",
    border: "1px solid rgba(200,81,106,0.25)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(200,81,106,0.1)",
  };
  const tilt = (i: number) => ({
    transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
  });

  if (photos.length === 1) {
    return (
      <div className="flex justify-center">
        <div className="relative w-[220px]" style={tilt(0)}>
          <div
            className="overflow-hidden rounded-lg"
            style={{ aspectRatio: "3/4", ...imgBox }}
          >
            <Image
              loading="eager"
              src={photos[0]}
              alt="Photo 1"
              fill
              className="object-cover"
              sizes="220px"
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
          <div key={i} className="relative flex-1 min-w-0" style={tilt(i)}>
            <div
              className="overflow-hidden rounded-lg"
              style={{ aspectRatio: "3/4", ...imgBox }}
            >
              <Image
                src={url}
                loading="eager"
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 160px"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (photos.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="relative" style={tilt(i)}>
            <div
              className="overflow-hidden rounded-lg"
              style={{ aspectRatio: "4/3", ...imgBox }}
            >
              <Image
                src={url}
                loading="eager"
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 45vw, 200px"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 5 photos: 3 top + 2 bottom
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 3).map((url, i) => (
          <div key={i} className="relative" style={tilt(i)}>
            <div
              className="overflow-hidden rounded-lg"
              style={{ aspectRatio: "2/3", ...imgBox }}
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                loading="eager"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 30vw, 140px"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-10">
        {photos.slice(3).map((url, i) => (
          <div key={i + 3} className="relative" style={tilt(i + 3)}>
            <div
              className="overflow-hidden rounded-lg"
              style={{ aspectRatio: "4/3", ...imgBox }}
            >
              <Image
                src={url}
                alt={`Photo ${i + 4}`}
                loading="eager"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 40vw, 180px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClassicTemplate({ data }: { data: MomentData }) {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const hasMusic = !!data.music?.track_id;
  const showModal = isClient && hasMusic && !dismissed;
  const showPlayer = dismissed && hasMusic;
  const photos = data.photos ?? [];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #3d0a1e 0%, #1c0510 35%, #0e0412 65%, #060108 100%)",
      }}
    >
      {/* Floating hearts */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {HEARTS.map((h) => (
            <span
              key={h.id}
              style={{
                position: "absolute",
                bottom: "-8%",
                left: `${h.left}%`,
                fontSize: `${h.size}px`,
                color: h.color,
                opacity: 0,
                animation: `floatHeart ${h.duration}s ease-in ${h.delay}s infinite`,
                willChange: "transform, opacity",
              }}
            >
              {h.char}
            </span>
          ))}
        </div>
      )}

      {/* Music modal */}
      {showModal && data.music && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(6, 1, 8, 0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-sm flex flex-col items-center gap-5 rounded-3xl p-8 relative"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,240,245,0.10) 0%, rgba(180,60,90,0.08) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(200, 81, 106, 0.3)",
              boxShadow:
                "0 0 80px rgba(200,81,106,0.2), inset 0 0 60px rgba(200,81,106,0.04)",
              animation: "fadeUp 0.6s ease both",
            }}
          >
            {data.music.album_image && (
              <div className="relative">
                <Image
                  src={data.music.album_image}
                  loading="eager"
                  alt={data.music.name || "Album"}
                  width={110}
                  height={110}
                  className="rounded-2xl"
                  style={{
                    boxShadow:
                      "0 0 40px rgba(200,81,106,0.5), 0 8px 32px rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
                  }}
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-rose-300/50 text-xs tracking-[0.35em] uppercase mb-2">
                a song for you
              </p>
              <p
                className="text-rose-100 text-xl font-light"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                }}
              >
                {data.music.name}
              </p>
              <p className="text-rose-300/60 text-sm mt-1">
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
                background: "linear-gradient(135deg, #c8516a 0%, #8b1a2e 100%)",
                boxShadow: "0 4px 24px rgba(200,81,106,0.4)",
              }}
            >
              Play for me ♡
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-rose-300/40 text-xs tracking-wider hover:text-rose-300/70 transition-colors"
            >
              I&apos;ll play it myself later
            </button>
          </div>
        </div>
      )}

      {/* Page content */}
      <div
        className="relative z-10 max-w-xl mx-auto px-6 py-16 flex flex-col items-center min-h-screen justify-center"
        style={{ opacity: isClient ? 1 : 0, transition: "opacity 1.6s ease" }}
      >
        <p
          className="text-rose-300/50 text-xs tracking-[0.45em] uppercase mb-4"
          style={{ animation: "fadeUp 1s ease 0.3s both" }}
        >
          with love
        </p>

        <h1
          className="text-5xl text-center text-rose-100 font-light mb-2"
          style={{
            fontFamily: "var(--font-cormorant)",
            letterSpacing: "0.05em",
            textShadow: "0 0 50px rgba(200, 81, 106, 0.45)",
            animation: "fadeUp 1s ease 0.5s both",
          }}
        >
          {data.occasion || "A Love Letter"}
        </h1>

        <div
          className="flex items-center gap-3 my-7"
          style={{ animation: "fadeUp 1s ease 0.7s both" }}
        >
          <div
            style={{
              height: "1px",
              width: "72px",
              background:
                "linear-gradient(to right, transparent, rgba(200, 81, 106, 0.65))",
            }}
          />
          <span className="text-rose-400/70 text-sm">✦</span>
          <span className="text-rose-300 text-lg">♡</span>
          <span className="text-rose-400/70 text-sm">✦</span>
          <div
            style={{
              height: "1px",
              width: "72px",
              background:
                "linear-gradient(to left, transparent, rgba(200, 81, 106, 0.65))",
            }}
          />
        </div>

        {data.headline && (
          <h2
            className="text-rose-200/70 text-xl text-center mb-8 font-light italic"
            style={{
              fontFamily: "var(--font-cormorant)",
              animation: "fadeUp 1s ease 0.9s both",
            }}
          >
            &ldquo;{data.headline}&rdquo;
          </h2>
        )}

        {photos.length > 0 && (
          <div
            className="w-full mb-8"
            style={{ animation: "fadeUp 1s ease 1s both" }}
          >
            <PhotoGrid photos={photos} />
          </div>
        )}

        <div
          className="w-full rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,240,245,0.07) 0%, rgba(180,60,90,0.05) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(200, 81, 106, 0.22)",
            animation:
              "fadeUp 1s ease 1.1s both, pulseGlow 5s ease-in-out 2.5s infinite",
          }}
        >
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: "130px",
              height: "130px",
              background:
                "radial-gradient(circle at 0% 0%, rgba(200,81,106,0.22), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 pointer-events-none"
            style={{
              width: "130px",
              height: "130px",
              background:
                "radial-gradient(circle at 100% 100%, rgba(200,81,106,0.22), transparent 70%)",
            }}
          />

          <p
            className="relative text-rose-50/90 whitespace-pre-line"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.25rem",
              fontStyle: "italic",
              lineHeight: "2",
            }}
          >
            {data.message}
          </p>

          {data.sender && (
            <p
              className="relative text-right mt-8 text-rose-300 font-light"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.4rem",
                fontStyle: "italic",
              }}
            >
              — {data.sender}
            </p>
          )}
        </div>

        {showPlayer && (
          <div
            className="w-full flex flex-col items-center gap-4"
            style={{ animation: "fadeUp 0.8s ease both" }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background: "rgba(200,81,106,0.4)",
                }}
              />
              <p className="text-rose-300/50 text-xs tracking-[0.3em] uppercase">
                a song for you
              </p>
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background: "rgba(200,81,106,0.4)",
                }}
              />
            </div>
            <iframe
              src={`https://open.spotify.com/embed/track/${data.music?.track_id}?utm_source=generator${autoplay ? "&autoplay=1" : ""}`}
              width="100%"
              height="152"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
              style={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 0 40px rgba(200, 81, 106, 0.18)",
              }}
              title={data.music?.name || "Song for you"}
            />
          </div>
        )}

        <p
          className="mt-14 text-rose-300/25 text-xs tracking-[0.35em] uppercase"
          style={{ animation: "fadeUp 1s ease 1.5s both" }}
        >
          made with ♡ on 2usforever.com
        </p>
      </div>

      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(0) scale(0.85) rotate(-8deg); opacity: 0; }
          8% { opacity: 0.65; }
          75% { opacity: 0.35; }
          100% { transform: translateY(-115vh) scale(1.15) rotate(12deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 25px rgba(200,81,106,0.07), inset 0 0 25px rgba(200,81,106,0.02);
            border-color: rgba(200,81,106,0.22);
          }
          50% {
            box-shadow: 0 0 60px rgba(200,81,106,0.28), inset 0 0 40px rgba(200,81,106,0.07);
            border-color: rgba(200,81,106,0.45);
          }
        }
      `}</style>
    </div>
  );
}
