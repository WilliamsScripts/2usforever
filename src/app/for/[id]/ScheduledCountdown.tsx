"use client";

import { formatScheduledDateLabel } from "@/lib/scheduled-date";
import {
  getScheduledCountdownTheme,
  type ScheduledCountdownTheme,
} from "@/lib/scheduled-countdown-themes";
import { useCountdown } from "@/hooks/useScheduledUnlock";

type ScheduledCountdownProps = {
  scheduledDate: string;
  recipient?: string | null;
  headline?: string | null;
  template?: string | null;
  onUnlocked: () => void;
};

function CountdownUnit({
  value,
  label,
  theme,
}: {
  value: number;
  label: string;
  theme: ScheduledCountdownTheme;
}) {
  return (
    <div
      className="flex min-w-[4.5rem] flex-col items-center rounded-2xl px-3 py-4"
      style={{
        background: theme.unitBackground,
        border: theme.unitBorder,
        boxShadow: theme.unitBoxShadow,
      }}
    >
      <span
        className="text-3xl font-light tabular-nums"
        style={{
          fontFamily: theme.fontFamily,
          color: theme.unitValueColor,
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="mt-1 text-[10px] uppercase tracking-[0.28em]"
        style={{ color: theme.unitLabelColor }}
      >
        {label}
      </span>
    </div>
  );
}

function ClassicBackground() {
  return (
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
  );
}

function FloralBackground() {
  const petals = ["#FFB0C8", "#FFC5D3", "#FFA8BE", "#FFD0DD", "#F9A8BE"];

  return (
    <>
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }} aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70vw",
            height: "50vh",
            background:
              "radial-gradient(ellipse at center, rgba(255,120,150,0.18) 0%, rgba(180,60,100,0.08) 50%, transparent 75%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "45vw",
            height: "35vh",
            background:
              "radial-gradient(ellipse at center, rgba(255,180,200,0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-8%",
              left: `${(i * 5.2) % 100}%`,
              fontSize: `${8 + (i % 4) * 2}px`,
              color: petals[i % petals.length],
              opacity: 0.45,
              animation: `petalDrift ${14 + (i % 6) * 1.5}s ease-in ${(i * 0.8) % 10}s infinite`,
            }}
          >
            ❀
          </span>
        ))}
      </div>
    </>
  );
}

function ModernBackground() {
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }} aria-hidden>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "10%",
          width: "80vw",
          height: "65vh",
          background:
            "radial-gradient(ellipse at center, rgba(55,35,160,0.28) 0%, rgba(40,20,120,0.1) 50%, transparent 75%)",
          filter: "blur(55px)",
          animation: "auroraDrift1 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: "70vw",
          height: "55vh",
          background:
            "radial-gradient(ellipse at center, rgba(90,25,140,0.18) 0%, rgba(60,10,100,0.08) 50%, transparent 75%)",
          filter: "blur(70px)",
          animation: "auroraDrift2 28s ease-in-out 6s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "-5%",
          width: "60vw",
          height: "45vh",
          background:
            "radial-gradient(ellipse at center, rgba(15,60,120,0.16) 0%, rgba(10,40,90,0.06) 50%, transparent 75%)",
          filter: "blur(60px)",
          animation: "auroraDrift3 20s ease-in-out 11s infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(2,5,15,0.82) 100%)",
        }}
      />
    </div>
  );
}

function StarryBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }} aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "75vw",
            height: "60vh",
            background:
              "radial-gradient(ellipse at center, rgba(110,35,160,0.28) 0%, rgba(80,20,120,0.12) 50%, transparent 75%)",
            filter: "blur(72px)",
            animation: "nebulaBreath1 26s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-5%",
            right: "0%",
            width: "65vw",
            height: "55vh",
            background:
              "radial-gradient(ellipse at center, rgba(180,40,110,0.18) 0%, rgba(140,20,80,0.08) 50%, transparent 75%)",
            filter: "blur(80px)",
            animation: "nebulaBreath2 32s ease-in-out 8s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0%",
            left: "20%",
            width: "50vw",
            height: "40vh",
            background:
              "radial-gradient(ellipse at center, rgba(200,120,40,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "nebulaBreath1 35s ease-in-out 4s infinite",
          }}
        />
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(5,0,15,0.85) 100%)",
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: `${(i * 7.3) % 90}%`,
              left: `${(i * 11.1) % 100}%`,
              fontSize: `${8 + (i % 3) * 3}px`,
              color: i % 5 === 0 ? "#E6C378" : "rgba(255,255,255,0.75)",
              opacity: 0.35 + (i % 4) * 0.1,
              animation: `starTwinkle ${2 + (i % 4)}s ease-in-out ${(i * 0.4) % 3}s infinite alternate`,
            }}
          >
            {i % 5 === 0 ? "✦" : "·"}
          </span>
        ))}
      </div>
    </>
  );
}

function TemplateBackground({ template }: { template?: string | null }) {
  switch (template) {
    case "modern":
      return <ModernBackground />;
    case "floral":
      return <FloralBackground />;
    case "starry":
      return <StarryBackground />;
    default:
      return <ClassicBackground />;
  }
}

function TemplateLabel({
  theme,
  template,
}: {
  theme: ScheduledCountdownTheme;
  template?: string | null;
}) {
  if (template === "modern") {
    return (
      <div
        className="mb-8 flex items-center gap-3"
        style={{ animation: "fadeUp 0.7s ease both" }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background: theme.dividerGradient,
          }}
        />
        <div
          style={{
            width: "7px",
            height: "7px",
            background: theme.accentColor,
            transform: "rotate(45deg)",
            boxShadow: `0 0 14px ${theme.accentColor}`,
            flexShrink: 0,
          }}
        />
        <span
          className="text-[10px] uppercase"
          style={{
            color: theme.labelColor,
            letterSpacing: theme.labelLetterSpacing,
          }}
        >
          opens on
        </span>
        <div
          style={{
            width: "7px",
            height: "7px",
            background: theme.accentColor,
            transform: "rotate(45deg)",
            boxShadow: `0 0 14px ${theme.accentColor}`,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            height: "1px",
            background: theme.dividerGradient.replace("to right", "to left"),
          }}
        />
      </div>
    );
  }

  if (template === "floral") {
    return (
      <div style={{ animation: "fadeUp 0.7s ease both" }}>
        <span
          className="mb-4 block text-sm"
          style={{
            color: theme.labelColor,
            letterSpacing: theme.labelLetterSpacing,
            textShadow: "0 0 24px rgba(212,137,159,0.65)",
          }}
        >
          ✿ ❀ ✿
        </span>
        <p
          className="mb-3 text-xs uppercase"
          style={{
            color: theme.labelColor,
            letterSpacing: theme.labelLetterSpacing,
          }}
        >
          opens on
        </p>
      </div>
    );
  }

  if (template === "starry") {
    return (
      <div style={{ animation: "fadeUp 0.7s ease both" }}>
        <p
          className="mb-4 text-[11px] uppercase"
          style={{
            color: theme.labelColor,
            letterSpacing: theme.labelLetterSpacing,
          }}
        >
          opens on
        </p>
        <div className="mb-6 flex items-center justify-center gap-3">
          <div
            style={{
              height: "1px",
              width: "60px",
              background: theme.dividerGradient,
            }}
          />
          <span style={{ color: theme.accentColor, fontSize: "10px" }}>✦</span>
          <span
            style={{
              color: "#C9A84C",
              fontSize: "14px",
              textShadow: "0 0 16px rgba(201,168,76,0.7)",
            }}
          >
            ✧
          </span>
          <span style={{ color: theme.accentColor, fontSize: "10px" }}>✦</span>
          <div
            style={{
              height: "1px",
              width: "60px",
              background: theme.dividerGradient.replace("to right", "to left"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <p
      className="mb-3 text-xs uppercase"
      style={{
        color: theme.labelColor,
        letterSpacing: theme.labelLetterSpacing,
        animation: "fadeUp 0.7s ease both",
      }}
    >
      opens on
    </p>
  );
}

export default function ScheduledCountdown({
  scheduledDate,
  recipient,
  headline,
  template,
  onUnlocked,
}: ScheduledCountdownProps) {
  const parts = useCountdown(scheduledDate, onUnlocked);
  const theme = getScheduledCountdownTheme(template);

  if (!parts) return null;

  const title =
    headline?.trim() ||
    (recipient?.trim()
      ? `Something special for ${recipient.trim()}`
      : "Something special is on its way");

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
      style={{ background: theme.background }}
    >
      <TemplateBackground template={template} />

      <div
        className="relative z-10 w-full max-w-lg text-center"
        style={{ animation: "fadeUp 0.7s ease both" }}
      >
        <TemplateLabel theme={theme} template={template} />

        <h1
          className="mb-2 text-3xl sm:text-4xl"
          style={{
            fontFamily: theme.fontFamily,
            fontStyle: theme.titleFontStyle,
            fontWeight: theme.titleFontWeight ?? 300,
            color: theme.titleColor,
            textShadow: theme.titleTextShadow,
          }}
        >
          {title}
        </h1>
        <p className="mb-10 text-sm" style={{ color: theme.dateColor }}>
          {formatScheduledDateLabel(scheduledDate)}
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <CountdownUnit value={parts.days} label="days" theme={theme} />
          <CountdownUnit value={parts.hours} label="hours" theme={theme} />
          <CountdownUnit value={parts.minutes} label="mins" theme={theme} />
          <CountdownUnit value={parts.seconds} label="secs" theme={theme} />
        </div>

        <p
          className="text-sm font-light leading-relaxed"
          style={{ color: theme.footnoteColor }}
        >
          A message is waiting. It unlocks at midnight on the day above.
        </p>
      </div>

      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(0) scale(0.85) rotate(-8deg); opacity: 0; }
          8% { opacity: 0.65; }
          75% { opacity: 0.35; }
          100% { transform: translateY(-115vh) scale(1.15) rotate(12deg); opacity: 0; }
        }
        @keyframes petalDrift {
          0%   { transform: translateY(0) rotate(0deg) translateX(0px); opacity: 0; }
          8%   { opacity: 0.8; }
          30%  { transform: translateY(28vh) rotate(120deg) translateX(22px); }
          60%  { transform: translateY(62vh) rotate(240deg) translateX(-16px); opacity: 0.5; }
          88%  { opacity: 0.18; }
          100% { transform: translateY(108vh) rotate(360deg) translateX(10px); opacity: 0; }
        }
        @keyframes auroraDrift1 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.7; }
          33%      { transform: translateX(-7%) translateY(6%) scale(1.1); opacity: 1; }
          66%      { transform: translateX(5%) translateY(-4%) scale(0.95); opacity: 0.8; }
        }
        @keyframes auroraDrift2 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.6; }
          40%      { transform: translateX(7%) translateY(-9%) scale(1.15); opacity: 0.9; }
          70%      { transform: translateX(-5%) translateY(5%) scale(0.9); opacity: 0.7; }
        }
        @keyframes auroraDrift3 {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          50%      { transform: translateX(9%) translateY(-6%); opacity: 0.8; }
        }
        @keyframes nebulaBreath1 {
          0%, 100% { transform: scale(1) translateX(0) translateY(0); opacity: 0.65; }
          33%      { transform: scale(1.08) translateX(-5%) translateY(4%); opacity: 1; }
          66%      { transform: scale(0.96) translateX(4%) translateY(-3%); opacity: 0.8; }
        }
        @keyframes nebulaBreath2 {
          0%, 100% { transform: scale(1) translateX(0) translateY(0); opacity: 0.55; }
          40%      { transform: scale(1.1) translateX(6%) translateY(-7%); opacity: 0.85; }
          70%      { transform: scale(0.92) translateX(-4%) translateY(5%); opacity: 0.65; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50%       { opacity: 1; transform: scale(1.45); }
        }
      `}</style>
    </div>
  );
}
