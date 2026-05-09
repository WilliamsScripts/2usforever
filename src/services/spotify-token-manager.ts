import "server-only";

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let inflightTokenRequest: Promise<string> | null = null;

const EXPIRY_BUFFER_MS = 60_000;

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getSpotifyCredentials() {
  // Prefer server-only env vars; keep fallback to avoid breaking local setup.
  const clientId =
    getEnv("SPOTIFY_CLIENT_ID") ?? getEnv("NEXT_PUBLIC_SPOTIFY_CLIENT_ID");
  const clientSecret =
    getEnv("SPOTIFY_CLIENT_SECRET") ?? getEnv("NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  return { clientId, clientSecret };
}

function isTokenValid() {
  return Boolean(cachedToken) && Date.now() < tokenExpiresAt - EXPIRY_BUFFER_MS;
}

async function fetchSpotifyAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getSpotifyCredentials();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token fetch failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

export async function getSpotifyAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && isTokenValid()) {
    return cachedToken as string;
  }

  if (!forceRefresh && inflightTokenRequest) {
    return inflightTokenRequest;
  }

  inflightTokenRequest = fetchSpotifyAccessToken()
    .catch((error) => {
      cachedToken = null;
      tokenExpiresAt = 0;
      throw error;
    })
    .finally(() => {
      inflightTokenRequest = null;
    });

  return inflightTokenRequest;
}
