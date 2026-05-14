const STORAGE_KEY = "2usforever:remember-device";

type RememberDeviceRecord = {
  email: string;
  trustedAt: number;
};

const TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function readRecord(): RememberDeviceRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RememberDeviceRecord;
  } catch {
    return null;
  }
}

export function isDeviceRemembered(email: string): boolean {
  const record = readRecord();
  if (!record) return false;

  const normalized = email.trim().toLowerCase();
  if (record.email !== normalized) return false;

  return Date.now() - record.trustedAt < TRUST_DURATION_MS;
}

export function rememberDevice(email: string): void {
  if (typeof window === "undefined") return;

  const payload: RememberDeviceRecord = {
    email: email.trim().toLowerCase(),
    trustedAt: Date.now(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearRememberedDevice(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
