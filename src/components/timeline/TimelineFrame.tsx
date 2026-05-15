"use client";

import Link from "next/link";
import { usePetalAnimation } from "@/hooks/usePetalAnimation";
import { LogOut, Plus } from "lucide-react";

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

export function TimelineFrame({
  children,
  email,
  onSignOut,
}: TimelineFrameProps) {
  return (
    <div className="timeline-shell">
      <PetalsCanvas />
      <header className="timeline-nav">
        <Link href="/" className="timeline-logo">
          2UsForever<span>.</span>
        </Link>
        <div className="timeline-nav-actions">
          <Link href="/create-moment" className="timeline-nav-cta">
            <span className="hidden sm:block">Create a moment</span>
            <span className="block sm:hidden">Create</span>
          </Link>
          {email ? (
            <div className="timeline-user">
              <span className="timeline-user-email">{email}</span>
              {onSignOut ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="timeline-signout"
                >
                  <span className="hidden sm:block">Sign out</span>
                  <LogOut className="block sm:hidden size-4" />
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
