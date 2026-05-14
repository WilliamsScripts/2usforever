"use client";

import { useMutation } from "@tanstack/react-query";
import { searchSpotifyTracks } from "@/services/spotify.service";

export function useSpotifySearch() {
  return useMutation({
    mutationFn: (query: string) => searchSpotifyTracks(query),
  });
}
