type LockMap = Map<string, Promise<unknown>>;

const locks: LockMap = new Map();

export async function withRequestLock<T>(
  key: string,
  task: () => Promise<T>,
): Promise<T> {
  const existing = locks.get(key);
  if (existing) {
    await existing.catch(() => undefined);
  }

  const run = task();
  locks.set(key, run);

  try {
    return await run;
  } finally {
    if (locks.get(key) === run) {
      locks.delete(key);
    }
  }
}

export function isRequestLocked(key: string): boolean {
  return locks.has(key);
}
