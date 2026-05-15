import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { OTP_PATTERN } from "@/lib/auth/otp";
import { createCallbackClient } from "@/lib/supabase/server";
import type { AuthApiErrorBody } from "@/types/auth";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  token: z
    .string()
    .trim()
    .regex(OTP_PATTERN, "Enter the code from your email"),
  next: z.string().optional(),
});

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/timeline";
  }
  return value;
}

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
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Enter the code from your email.",
        400,
        "INVALID_OTP",
      );
    }

    const next = safeNextPath(parsed.data.next);
    const response = NextResponse.json({ ok: true, next });
    const supabase = createCallbackClient(request, response);

    const { error } = await supabase.auth.verifyOtp({
      email: parsed.data.email.toLowerCase(),
      token: parsed.data.token,
      type: "email",
    });

    if (error) {
      const mapped = mapSupabaseAuthError(error.message, error.code, "verify");
      return errorResponse(
        mapped.message,
        mapped.code === "RATE_LIMITED" ? 429 : 401,
        mapped.code,
        error.message,
      );
    }

    return response;
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected server error",
      500,
      "UNKNOWN",
    );
  }
}
