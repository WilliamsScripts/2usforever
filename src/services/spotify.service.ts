import { apiRequest } from "@/lib/api-client";
import type { SpotifyTrack } from "@/types/spotify";

export async function searchSpotifyTracks(query: string): Promise<SpotifyTrack[]> {
  return apiRequest<SpotifyTrack[]>(
    `/api/spotify/search?q=${encodeURIComponent(query)}`,
  );
}
