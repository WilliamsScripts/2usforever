"use client";

import { useState, useSyncExternalStore } from "react";
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

export default function StarryTemplate({ data }: { data: MomentData }) {
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
                boxShadow: "0 0 30px rgba(201,168,76,0.12)",
              }}
              title={data.music?.name || "Song for you"}
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
