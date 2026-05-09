import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/services/spotify-token-manager";

type SpotifyTrackItem = {
  id: string;
  name: string;
  artists?: Array<{ name: string }>;
  album?: { images?: Array<{ url: string }> };
  external_urls?: { spotify?: string };
};

type SimplifiedTrack = {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  spotifyUrl: string | null;
  trackId: string;
};

function simplifyTrack(track: SpotifyTrackItem): SimplifiedTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.map((artist) => artist.name).join(", ") || "Unknown",
    albumImage: track.album?.images?.[0]?.url ?? null,
    spotifyUrl: track.external_urls?.spotify ?? null,
    trackId: track.id,
  };
}

async function searchSpotify(query: string, forceRefresh = false) {
  const token = await getSpotifyAccessToken(forceRefresh);
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "50",
  });

  const response = await fetch(
    `https://api.spotify.com/v1/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    return NextResponse.json(
      {
        error: "Spotify rate limit reached. Please try again shortly.",
        retryAfter: retryAfter ? Number(retryAfter) : null,
      },
      { status: 429 },
    );
  }

  if (response.status === 401 && !forceRefresh) {
    return searchSpotify(query, true);
  }

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: `Spotify search failed (${response.status}): ${text}` },
      { status: response.status },
    );
  }

  const data = await response.json();
  const items = (data?.tracks?.items ?? []) as SpotifyTrackItem[];
  const tracks = items.map(simplifyTrack);

  return NextResponse.json(tracks);
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter q is required" },
        { status: 400 },
      );
    }

    return await searchSpotify(query);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Spotify integration error",
      },
      { status: 500 },
    );
  }
}
