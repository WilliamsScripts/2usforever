import { apiRequest } from "@/lib/api-client";

export async function sendOtp(email: string) {
  return apiRequest<{ ok: true }>("/api/auth/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, token: string, next?: string) {
  return apiRequest<{ ok: true; next: string }>("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, next }),
  });
}

export async function signOut() {
  return apiRequest<{ ok: true }>("/api/auth/signout", {
    method: "POST",
  });
}
