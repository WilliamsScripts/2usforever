import { ApiError } from "@/lib/api-client";
import {
  AuthError,
  type AuthApiErrorBody,
  type AuthErrorCode,
} from "@/types/auth";

const FRIENDLY_MESSAGES: Record<AuthErrorCode, string> = {
  RATE_LIMITED: "Too many attempts. Please wait a moment before trying again.",
  INVALID_OTP:
    "That code is incorrect or no longer valid. Check your latest email and try again.",
  EXPIRED_OTP: "That code has expired. Request a new one to continue.",
  INVALID_EMAIL: "Enter a valid email address.",
  CAPTCHA_FAILED: "Security check failed. Please try again.",
  NETWORK_ERROR: "Connection problem. Check your network and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

const SEND_RATE_LIMIT_MESSAGE =
  "You can request a new code in about a minute. Please wait before resending.";
const VERIFY_RATE_LIMIT_MESSAGE =
  "Too many sign-in attempts. Please wait a moment and try again.";

const SUPABASE_CODE_TO_AUTH: Record<string, AuthErrorCode> = {
  otp_expired: "INVALID_OTP",
  over_email_send_rate_limit: "RATE_LIMITED",
  over_request_rate_limit: "RATE_LIMITED",
};

export function getFriendlyAuthMessage(code: AuthErrorCode): string {
  return FRIENDLY_MESSAGES[code];
}

function inferCodeFromMessage(message: string): AuthErrorCode {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("too many") ||
    normalized.includes("over_email_send_rate_limit") ||
    normalized.includes("over_request_rate_limit") ||
    normalized.includes("only request this once every")
  ) {
    return "RATE_LIMITED";
  }

  if (
    normalized.includes("expired or is invalid") ||
    normalized.includes("otp_expired")
  ) {
    return "INVALID_OTP";
  }

  if (normalized.includes("expired")) {
    return "EXPIRED_OTP";
  }

  if (
    normalized.includes("invalid") ||
    normalized.includes("token") ||
    normalized.includes("otp")
  ) {
    return "INVALID_OTP";
  }

  if (normalized.includes("captcha") || normalized.includes("turnstile")) {
    return "CAPTCHA_FAILED";
  }

  if (normalized.includes("email")) {
    return "INVALID_EMAIL";
  }

  return "UNKNOWN";
}

export function parseAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof ApiError) {
    const body = (error.details ?? {}) as AuthApiErrorBody;
    const code =
      body.code ??
      inferCodeFromMessage(body.details ?? body.error ?? error.message);
    const message =
      body.error && body.code
        ? body.error
        : getFriendlyAuthMessage(code);

    return new AuthError(message, code, error.status);
  }

  if (error instanceof TypeError) {
    return new AuthError(
      getFriendlyAuthMessage("NETWORK_ERROR"),
      "NETWORK_ERROR",
    );
  }

  return new AuthError(getFriendlyAuthMessage("UNKNOWN"), "UNKNOWN");
}

type AuthErrorContext = "send" | "verify";

function getRateLimitMessage(context: AuthErrorContext): string {
  return context === "send"
    ? SEND_RATE_LIMIT_MESSAGE
    : VERIFY_RATE_LIMIT_MESSAGE;
}

export function mapSupabaseAuthError(
  message: string,
  errorCode?: string,
  context: AuthErrorContext = "verify",
): {
  code: AuthErrorCode;
  message: string;
} {
  const code =
    (errorCode && SUPABASE_CODE_TO_AUTH[errorCode]) ||
    inferCodeFromMessage(message);

  const friendlyMessage =
    code === "RATE_LIMITED"
      ? getRateLimitMessage(context)
      : getFriendlyAuthMessage(code);

  return {
    code,
    message: friendlyMessage,
  };
}
