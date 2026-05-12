"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

function usePetalAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const symbols = ["♡", "✿", "❀", "·", "°"];
    const petals = Array.from({ length: 38 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 10 + Math.random() * 14,
      speed: 0.3 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      opacity: 0.15 + Math.random() * 0.3,
      sym: symbols[Math.floor(Math.random() * symbols.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    }));

    function drawPetals() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = "#C8516A";
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillText(p.sym, 0, 0);
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
        if (p.y > window.innerHeight + 20) {
          p.y = -20;
          p.x = Math.random() * window.innerWidth;
        }
      });
      animationFrameId = requestAnimationFrame(drawPetals);
    }

    drawPetals();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return canvasRef;
}

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
            <Link href="/#occasions">Occasions</Link>
          </li>
          <li>
            <Link href="/#how">How it works</Link>
          </li>
          <li>
            <Link href="/#pricing">Pricing</Link>
          </li>
          <li>
            <Link href={ctaHref} className="nav-cta">
              Create yours →
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
            <p>Making love unforgettable — one beautiful moment at a time.</p>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <a href="#">About us</a>
            <Link href="/#how">How it works</Link>
            <Link href="/#pricing">Pricing</Link>
            <a href="#">Contact</a>
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
