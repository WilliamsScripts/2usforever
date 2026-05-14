"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCountdownParts,
  isMomentUnlocked,
} from "@/lib/scheduled-date";

export function useCountdown(
  scheduledDate: string,
  onUnlocked: () => void,
) {
  const [parts, setParts] = useState(() => getCountdownParts(scheduledDate));

  useEffect(() => {
    const tick = () => {
      if (isMomentUnlocked(scheduledDate)) {
        onUnlocked();
        return;
      }
      setParts(getCountdownParts(scheduledDate));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [scheduledDate, onUnlocked]);

  return parts;
}

export function useScheduledUnlock(scheduledDate?: string | null) {
  const [unlocked, setUnlocked] = useState(() =>
    isMomentUnlocked(scheduledDate),
  );
  const handleUnlocked = useCallback(() => setUnlocked(true), []);

  return { unlocked, handleUnlocked };
}
