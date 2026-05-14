"use client";

import { useEffect, useRef } from "react";

export function usePetalAnimation() {
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

    const symbols = ["♡", "✿", "❀", "·", "✦", "°", "❁", "❧"];
    const colors = [
      "#C8516A",
      "#D4738A",
      "#E8A0B0",
      "#C8516A",
      "#B84060",
      "#D4899F",
    ];
    const petals = Array.from({ length: 58 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 9 + Math.random() * 16,
      speed: 0.2 + Math.random() * 0.65,
      drift: (Math.random() - 0.5) * 0.55,
      opacity: 0.08 + Math.random() * 0.28,
      sym: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.55,
    }));

    function drawPetals() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillText(p.sym, 0, 0);
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
        if (p.y > window.innerHeight + 24) {
          p.y = -24;
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
