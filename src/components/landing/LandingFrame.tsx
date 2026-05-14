"use client";

import React from "react";
import Link from "next/link";
import { usePetalAnimation } from "@/hooks/usePetalAnimation";

function PetalsCanvas() {
  const canvasRef = usePetalAnimation();

  return (
    <canvas
      id="petals-canvas"
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

type LandingFrameProps = {
  children: React.ReactNode;
  ctaHref?: string;
};

export default function LandingFrame({
  children,
  ctaHref = "/create-moment",
}: LandingFrameProps) {
  return (
    <>
      <PetalsCanvas />
      <nav>
        <Link href="/" className="logo">
          2UsForever<span>.</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/#how">How it works</Link>
          </li>
          <li>
            <Link href="/#occasions">Occasions</Link>
          </li>
          <li>
            <Link href="/#pricing">Pricing</Link>
          </li>
          <li>
            <Link href={ctaHref} className="nav-cta">
              Create a moment
            </Link>
          </li>
        </ul>
      </nav>

      {children}

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <Link
              href="/"
              className="logo"
              style={{
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Playfair Display',serif",
              }}
            >
              2UsForever<span style={{ color: "var(--rose)" }}>.</span>
            </Link>
            <p>Making love unforgettable, one beautiful moment at a time.</p>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <Link href="/#how">How it works</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/#occasions">Occasions</Link>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 2UsForever.</span>
        </div>
      </footer>
    </>
  );
}
