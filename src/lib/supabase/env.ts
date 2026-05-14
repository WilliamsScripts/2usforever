export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return url;
}

export function getSupabaseAnonKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Supabase anon key is not configured");
  }
  return key;
}

function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

function isLocalhostHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalhostOrigin(origin: string) {
  try {
    return isLocalhostHost(new URL(origin).hostname);
  } catch {
    return isLocalhostHost(origin);
  }
}

export function getAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) {
    return normalizeOrigin(fromEnv);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalizeOrigin(`https://${vercelUrl}`);
  }

  return "https://2usforever.vercel.app";
}

/** Public origin for auth redirects; avoids localhost when deployed behind a proxy. */
export function getRequestOrigin(request: {
  headers: { get(name: string): string | null };
  nextUrl: { origin: string; protocol: string };
}) {
  const configured = process.env.NEXT_PUBLIC_APP_URL
    ? normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL)
    : null;

  if (configured && !isLocalhostOrigin(configured)) {
    return configured;
  }

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    "https";

  if (forwardedHost && !isLocalhostHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host && !isLocalhostHost(host)) {
    const proto = request.nextUrl.protocol.replace(":", "") || "https";
    return `${proto}://${host}`;
  }

  if (configured) {
    return configured;
  }

  const { origin } = request.nextUrl;
  if (!isLocalhostOrigin(origin)) {
    return origin;
  }

  return getAppUrl();
}
