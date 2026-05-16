"use client";

import Link from "next/link";

export type StatusScreenVariant =
  | "not-found"
  | "server-error"
  | "moment-not-found"
  | "moment-awaiting";

type StatusScreenProps = {
  variant: StatusScreenVariant;
  recipientName?: string | null;
  occasion?: string | null;
  onRetry?: () => void;
};

const CONTENT: Record<
  StatusScreenVariant,
  {
    code: string;
    eyebrow: string;
    title: string;
    titleEmphasis?: string;
    body: string;
    primaryCta: { href: string; label: string };
    secondaryCta?: { href: string; label: string };
  }
> = {
  "not-found": {
    code: "404",
    eyebrow: "Lost in the petals",
    title: "This page",
    titleEmphasis: "isn't here",
    body: "The link may have changed, or the page never existed. Let's find your way back to something beautiful.",
    primaryCta: { href: "/", label: "Back to home" },
    secondaryCta: { href: "/create-moment", label: "Create a moment" },
  },
  "server-error": {
    code: "500",
    eyebrow: "A brief interruption",
    title: "Something went",
    titleEmphasis: "awry",
    body: "Our hearts are in the right place, but the server stumbled. Please try again in a moment.",
    primaryCta: { href: "/", label: "Back to home" },
  },
  "moment-not-found": {
    code: "—",
    eyebrow: "A quiet link",
    title: "This moment",
    titleEmphasis: "couldn't be found",
    body: "It may have been removed, or the link might be incomplete. If someone sent this to you, ask them to share it again.",
    primaryCta: { href: "/", label: "Discover 2UsForever" },
    secondaryCta: { href: "/create-moment", label: "Create your own" },
  },
  "moment-awaiting": {
    code: "♡",
    eyebrow: "Almost ready",
    title: "Something beautiful",
    titleEmphasis: "is on its way",
    body: "Someone is putting the finishing touches on a private page made just for you. Return soon — love is worth the wait.",
    primaryCta: { href: "/", label: "While you wait" },
  },
};

function FloatingHearts() {
  return (
    <div aria-hidden className="status-hearts">
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="status-heart"
          style={{
            left: `${(i * 7.3) % 100}%`,
            fontSize: `${14 + (i % 4) * 4}px`,
            animationDuration: `${9 + (i % 5)}s`,
            animationDelay: `${(i * 0.55) % 7}s`,
            opacity: 0.2 + (i % 3) * 0.12,
          }}
        >
          ♡
        </span>
      ))}
    </div>
  );
}

export function StatusScreen({
  variant,
  recipientName,
  occasion,
  onRetry,
}: StatusScreenProps) {
  const config = CONTENT[variant];
  const personalizedBody =
    variant === "moment-awaiting" && recipientName?.trim()
      ? occasion?.trim()
        ? `A ${occasion.toLowerCase()} page for ${recipientName.trim()} is being prepared with care. Return soon — it won't be long.`
        : `A private page for ${recipientName.trim()} is being prepared with care. Return soon — it won't be long.`
      : config.body;

  return (
    <div className="status-screen">
      <FloatingHearts />
      <div className="status-glow" aria-hidden />

      <main className="status-content">
        <p className="status-code">{config.code}</p>
        <p className="status-eyebrow">{config.eyebrow}</p>

        <h1 className="status-title">
          {config.title}
          {config.titleEmphasis ? (
            <>
              <br />
              <em>{config.titleEmphasis}</em>
            </>
          ) : null}
        </h1>

        <p className="status-body">{personalizedBody}</p>

        <div className="status-actions">
          {onRetry ? (
            <button type="button" className="status-btn-primary" onClick={onRetry}>
              Try again
            </button>
          ) : (
            <Link href={config.primaryCta.href} className="status-btn-primary">
              {config.primaryCta.label}
            </Link>
          )}
          {config.secondaryCta ? (
            <Link href={config.secondaryCta.href} className="status-btn-secondary">
              {config.secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </main>

      <footer className="status-footer">
        <Link href="/" className="status-logo">
          2UsForever<span>.</span>
        </Link>
      </footer>
    </div>
  );
}
