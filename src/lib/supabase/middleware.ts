import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export async function updateSession(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const { pathname } = request.nextUrl;

  // Supabase often redirects to Site URL (/) with ?code= when the exact
  // emailRedirectTo is not allowlisted — forward to our callback handler.
  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) {
      url.searchParams.set("next", "/timeline");
    }
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isTimelineLogin = pathname === "/timeline/login";
  const isTimelineProtected =
    pathname.startsWith("/timeline") && !isTimelineLogin;

  if (isTimelineProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/timeline/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isTimelineLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.searchParams.get("next") || "/timeline";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
