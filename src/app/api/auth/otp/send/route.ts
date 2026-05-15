import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mapSupabaseAuthError } from "@/lib/auth/errors";
import {
  isCaptchaConfigured,
  verifyTurnstileToken,
} from "@/lib/captcha/verify-turnstile";
import { createClient } from "@/lib/supabase/server";
import type { AuthApiErrorBody } from "@/types/auth";

const sendOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  captchaToken: z.string().trim().optional(),
  rememberDevice: z.boolean().optional(),
});

function errorResponse(
  message: string,
  status: number,
  code: AuthApiErrorBody["code"],
  details?: string,
) {
  return NextResponse.json(
    { error: message, code, details } satisfies AuthApiErrorBody,
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Enter a valid email address.",
        400,
        "INVALID_EMAIL",
      );
    }

    if (isCaptchaConfigured()) {
      const token = parsed.data.captchaToken;
      if (!token) {
        return errorResponse(
          "Complete the security check before continuing.",
          400,
          "CAPTCHA_FAILED",
        );
      }

      const remoteIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        undefined;
      const captchaValid = await verifyTurnstileToken(token, remoteIp);

      if (!captchaValid) {
        return errorResponse(
          "Security check failed. Please try again.",
          400,
          "CAPTCHA_FAILED",
        );
      }
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email.toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      const mapped = mapSupabaseAuthError(error.message, error.code, "send");
      const status = mapped.code === "RATE_LIMITED" ? 429 : 500;
      return errorResponse(mapped.message, status, mapped.code, error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected server error",
      500,
      "UNKNOWN",
    );
  }
}
