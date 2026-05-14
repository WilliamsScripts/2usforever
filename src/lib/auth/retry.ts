import { parseAuthError } from "@/lib/auth/errors";

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 400,
  maxDelayMs: 4_000,
  shouldRetry: (error: unknown) => {
    const authError = parseAuthError(error);
    if (authError.code === "RATE_LIMITED") {
      return false;
    }

    if (error instanceof Error && error.name === "AuthError") {
      return false;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
    ) {
      const status = (error as { status: number }).status;
      return status >= 500;
    }

    return error instanceof TypeError;
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  task: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (
        attempt >= config.maxAttempts ||
        !config.shouldRetry(error, attempt)
      ) {
        throw error;
      }

      const backoff = Math.min(
        config.baseDelayMs * 2 ** (attempt - 1),
        config.maxDelayMs,
      );
      await delay(backoff);
    }
  }

  throw lastError;
}
