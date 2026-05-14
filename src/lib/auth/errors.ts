import { ApiError } from "@/lib/api-client";
import {
  AuthError,
  type AuthApiErrorBody,
  type AuthErrorCode,
} from "@/types/auth";

const FRIENDLY_MESSAGES: Record<AuthErrorCode, string> = {
  RATE_LIMITED: "Too many attempts. Please wait a moment before trying again.",
  INVALID_OTP: "That code is incorrect. Check your email and try again.",
  EXPIRED_OTP: "That code has expired. Request a new one to continue.",
  INVALID_EMAIL: "Enter a valid email address.",
  CAPTCHA_FAILED: "Security check failed. Please try again.",
  NETWORK_ERROR: "Connection problem. Check your network and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

export function getFriendlyAuthMessage(code: AuthErrorCode): string {
  return FRIENDLY_MESSAGES[code];
}

function inferCodeFromMessage(message: string): AuthErrorCode {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate") ||
    normalized.includes("too many") ||
    normalized.includes("over_email_send_rate_limit") ||
    normalized.includes("429")
  ) {
    return "RATE_LIMITED";
  }

  if (normalized.includes("expired") || normalized.includes("otp_expired")) {
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

export function mapSupabaseAuthError(message: string): {
  code: AuthErrorCode;
  message: string;
} {
  const code = inferCodeFromMessage(message);
  return {
    code,
    message: getFriendlyAuthMessage(code),
  };
}
