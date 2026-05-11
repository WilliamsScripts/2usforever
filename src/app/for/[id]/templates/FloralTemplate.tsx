"use client";

import { useState, useSyncExternalStore } from "react";
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

export default function FloralTemplate({ data }: { data: MomentData }) {
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
                boxShadow: "0 4px 24px rgba(180,60,90,0.12)",
              }}
              title={data.music?.name || "Song for you"}
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
