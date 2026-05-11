"use client";

import Image from "next/image";
import { MomentData } from "../types";

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

export default function ModernTemplate({ data }: { data: MomentData }) {
  const photos = data.photos ?? [];
  const hasMusic = !!data.music?.track_id;

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F2" }}>
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

        {/* Music: always visible, no modal */}
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
            <iframe
              src={`https://open.spotify.com/embed/track/${data.music?.track_id}?utm_source=generator`}
              width="100%"
              height="152"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 2px 16px rgba(184,67,90,0.08)",
              }}
              title={data.music?.name || "Song for you"}
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
