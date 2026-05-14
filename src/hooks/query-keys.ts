export const queryKeys = {
  moments: {
    all: ["moments"] as const,
    detail: (id: string) => ["moments", id] as const,
  },
  timeline: {
    all: ["timeline"] as const,
  },
  spotify: {
    search: (query: string) => ["spotify", "search", query] as const,
  },
} as const;
