import { apiRequest } from "@/lib/api-client";
import { parseAuthError } from "@/lib/auth/errors";
import { rememberDevice } from "@/lib/auth/remember-device";
import {
  type SendOtpPayload,
  type SendOtpResult,
  type VerifyOtpPayload,
  type VerifyOtpResult,
} from "@/types/auth";

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResult> {
  try {
    return await apiRequest<SendOtpResult>("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw parseAuthError(error);
  }
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  try {
    return await apiRequest<VerifyOtpResult>("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw parseAuthError(error);
  }
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
