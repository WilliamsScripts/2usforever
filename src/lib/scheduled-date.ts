const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseScheduledDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function isValidScheduledDate(dateStr: string | null | undefined): boolean {
  if (!dateStr || !DATE_ONLY.test(dateStr)) return false;
  const parsed = parseScheduledDate(dateStr);
  return !Number.isNaN(parsed.getTime());
}

export function isMomentUnlocked(
  scheduledDate: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!isValidScheduledDate(scheduledDate)) return true;
  return now >= parseScheduledDate(scheduledDate!).getTime();
}

export function getCountdownParts(
  scheduledDate: string,
  now = Date.now(),
): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (!isValidScheduledDate(scheduledDate)) return null;

  const diff = parseScheduledDate(scheduledDate).getTime() - now;
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function formatScheduledDateLabel(dateStr: string): string {
  return parseScheduledDate(dateStr).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
