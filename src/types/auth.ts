import type { Session, User } from "@supabase/supabase-js";

export type AuthErrorCode =
  | "RATE_LIMITED"
  | "INVALID_OTP"
  | "EXPIRED_OTP"
  | "INVALID_EMAIL"
  | "CAPTCHA_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type AuthUser = Pick<User, "id" | "email" | "user_metadata">;

export type AuthSession = Pick<Session, "access_token" | "expires_at"> & {
  user: AuthUser;
};

export type SendOtpPayload = {
  email: string;
  captchaToken?: string;
  rememberDevice?: boolean;
};

export type VerifyOtpPayload = {
  email: string;
  token: string;
  next?: string;
};

export type SendOtpResult = { ok: true };

export type VerifyOtpResult = { ok: true; next: string };

export type AuthApiErrorBody = {
  error?: string;
  code?: AuthErrorCode;
  details?: string;
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status?: number;

  constructor(message: string, code: AuthErrorCode, status?: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export type ResendAnalyticsEvent = "otp_sent" | "otp_resent" | "otp_send_failed";

export type ResendAnalyticsHandler = (
  event: ResendAnalyticsEvent,
  metadata: { email: string; attempt?: number },
) => void;
