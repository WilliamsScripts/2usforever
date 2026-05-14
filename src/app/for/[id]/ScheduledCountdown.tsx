"use client";

import { formatScheduledDateLabel } from "@/lib/scheduled-date";
import { useCountdown } from "@/hooks/useScheduledUnlock";

type ScheduledCountdownProps = {
  scheduledDate: string;
  recipient?: string | null;
  headline?: string | null;
  onUnlocked: () => void;
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex min-w-[4.5rem] flex-col items-center rounded-2xl px-3 py-4"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,240,245,0.10) 0%, rgba(180,60,90,0.08) 100%)",
        border: "1px solid rgba(200, 81, 106, 0.28)",
        boxShadow: "0 0 40px rgba(200,81,106,0.12)",
      }}
    >
      <span
        className="text-3xl font-light tabular-nums text-rose-50"
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-rose-300/55">
        {label}
      </span>
    </div>
  );
}

export default function ScheduledCountdown({
  scheduledDate,
  recipient,
  headline,
  onUnlocked,
}: ScheduledCountdownProps) {
  const parts = useCountdown(scheduledDate, onUnlocked);

  if (!parts) return null;

  const title =
    headline?.trim() ||
    (recipient?.trim()
      ? `Something special for ${recipient.trim()}`
      : "Something special is on its way");

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #3d0a1e 0%, #1c0510 35%, #0e0412 65%, #060108 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              bottom: "-8%",
              left: `${(i * 5.7) % 100}%`,
              fontSize: `${12 + (i % 5) * 3}px`,
              color: ["#f5a0b5", "#f5d6dc", "#e8b4bf"][i % 3],
              opacity: 0.35,
              animation: `floatHeart ${7 + (i % 6)}s ease-in ${(i * 0.6) % 8}s infinite`,
            }}
          >
            ♡
          </span>
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-lg text-center"
        style={{ animation: "fadeUp 0.7s ease both" }}
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-rose-300/50">
          opens on
        </p>
        <h1
          className="mb-2 text-3xl font-light text-rose-50 sm:text-4xl"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          {title}
        </h1>
        <p className="mb-10 text-sm text-rose-200/65">
          {formatScheduledDateLabel(scheduledDate)}
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <CountdownUnit value={parts.days} label="days" />
          <CountdownUnit value={parts.hours} label="hours" />
          <CountdownUnit value={parts.minutes} label="mins" />
          <CountdownUnit value={parts.seconds} label="secs" />
        </div>

        <p className="text-sm font-light leading-relaxed text-rose-300/55">
          A message is waiting. It unlocks at midnight on the day above.
        </p>
      </div>
    </div>
  );
}
