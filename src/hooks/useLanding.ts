"use client";

import { useEffect, useState } from "react";

export function useStepReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.15 },
    );
    document
      .querySelectorAll<HTMLElement>(".step")
      .forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
}

export function useIsNigeria() {
  const [isNigeria] = useState(() => {
    if (typeof window === "undefined") return true;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return (
      tz.toLowerCase().includes("africa") || tz.toLowerCase().includes("lagos")
    );
  });
  return isNigeria;
}
