"use client";

import { useCallback, useRef, useState } from "react";

export function useHorizontalScrollFades() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateFades = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const nudge = useCallback((dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }, []);

  return { scrollerRef, showLeft, showRight, updateFades, nudge };
}
