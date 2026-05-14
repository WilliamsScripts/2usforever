"use client";

import Link from "next/link";
import { usePetalAnimation } from "@/hooks/usePetalAnimation";

type TimelineFrameProps = {
  children: React.ReactNode;
  email?: string;
  onSignOut?: () => void;
};

function PetalsCanvas() {
  const canvasRef = usePetalAnimation();

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-45"
      aria-hidden
    />
  );
}

export function TimelineFrame({ children, email, onSignOut }: TimelineFrameProps) {
  return (
    <div className="timeline-shell">
      <PetalsCanvas />
      <header className="timeline-nav">
        <Link href="/" className="timeline-logo">
          2UsForever<span>.</span>
        </Link>
        <div className="timeline-nav-actions">
          <Link href="/create-moment" className="timeline-nav-cta">
            Create a moment
          </Link>
          {email ? (
            <div className="timeline-user">
              <span className="timeline-user-email">{email}</span>
              {onSignOut ? (
                <button type="button" onClick={onSignOut} className="timeline-signout">
                  Sign out
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
      <main className="timeline-main">{children}</main>
    </div>
  );
}
