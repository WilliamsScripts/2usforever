import { type NextRequest, NextResponse } from "next/server";
import { createCallbackClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/timeline";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/timeline/login?error=auth", request.url),
    );
  }

  const redirectTarget = new URL(next, request.url);
  const response = NextResponse.redirect(redirectTarget);
  const supabase = createCallbackClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(
      new URL("/timeline/login?error=auth", request.url),
    );
  }

  return response;
}
