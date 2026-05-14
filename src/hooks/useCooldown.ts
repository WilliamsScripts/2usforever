"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_COOLDOWN_SECONDS = 60;

type CooldownStorageRecord = {
  expiresAt: number;
};

function getStorageKey(scope: string) {
  return `2usforever:otp-cooldown:${scope}`;
}

function readCooldown(scope: string): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(getStorageKey(scope));
    if (!raw) return 0;

    const record = JSON.parse(raw) as CooldownStorageRecord;
    const remainingMs = record.expiresAt - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  } catch {
    return 0;
  }
}

function writeCooldown(scope: string, seconds: number) {
  if (typeof window === "undefined") return;

  const record: CooldownStorageRecord = {
    expiresAt: Date.now() + seconds * 1000,
  };

  window.localStorage.setItem(getStorageKey(scope), JSON.stringify(record));
}

export type UseCooldownOptions = {
  scope: string;
  durationSeconds?: number;
};

export function useCooldown({
  scope,
  durationSeconds = DEFAULT_COOLDOWN_SECONDS,
}: UseCooldownOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    readCooldown(scope),
  );

  useEffect(() => {
    setRemainingSeconds(readCooldown(scope));
  }, [scope]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      const next = readCooldown(scope);
      setRemainingSeconds(next);
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds, scope]);

  const startCooldown = useCallback(() => {
    writeCooldown(scope, durationSeconds);
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds, scope]);

  const isCoolingDown = remainingSeconds > 0;

  const label = useMemo(() => {
    if (!isCoolingDown) return null;
    return `Resend code in ${remainingSeconds}s`;
  }, [isCoolingDown, remainingSeconds]);

  return {
    remainingSeconds,
    isCoolingDown,
    startCooldown,
    label,
  };
}
