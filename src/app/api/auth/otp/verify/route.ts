import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCallbackClient } from "@/lib/supabase/server";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
  next: z.string().optional(),
});

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/timeline";
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid code", issues: parsed.error.issues },
        { status: 400 },
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
      return NextResponse.json(
        { error: "Invalid or expired code", details: error.message },
        { status: 401 },
      );
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
