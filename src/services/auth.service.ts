import { apiRequest } from "@/lib/api-client";
import { parseAuthError } from "@/lib/auth/errors";
import { withRequestLock } from "@/lib/auth/request-lock";
import { withRetry } from "@/lib/auth/retry";
import { rememberDevice } from "@/lib/auth/remember-device";
import {
  type SendOtpPayload,
  type SendOtpResult,
  type VerifyOtpPayload,
  type VerifyOtpResult,
} from "@/types/auth";

const SEND_LOCK_KEY = "auth:send-otp";
const VERIFY_LOCK_KEY = "auth:verify-otp";

async function requestSendOtp(payload: SendOtpPayload): Promise<SendOtpResult> {
  try {
    return await withRetry(() =>
      apiRequest<SendOtpResult>("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
  } catch (error) {
    throw parseAuthError(error);
  }
}

async function requestVerifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  try {
    return await withRetry(
      () =>
        apiRequest<VerifyOtpResult>("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      {
        maxAttempts: 2,
        shouldRetry: (error) => {
          const authError = parseAuthError(error);
          return authError.code === "NETWORK_ERROR";
        },
      },
    );
  } catch (error) {
    throw parseAuthError(error);
  }
}

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResult> {
  return withRequestLock(SEND_LOCK_KEY, () => requestSendOtp(payload));
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  const result = await withRequestLock(VERIFY_LOCK_KEY, () =>
    requestVerifyOtp(payload),
  );

  return result;
}

export async function signOut(): Promise<{ ok: true }> {
  try {
    return await apiRequest<{ ok: true }>("/api/auth/signout", {
      method: "POST",
    });
  } catch (error) {
    throw parseAuthError(error);
  }
}

export function persistRememberDevice(email: string): void {
  rememberDevice(email);
}
