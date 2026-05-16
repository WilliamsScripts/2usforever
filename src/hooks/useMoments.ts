"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createMoment, getMoment } from "@/services/moments.service";
import { queryKeys } from "@/hooks/query-keys";
import type {
  CreateMomentPayload,
  CreateMomentResponse,
  MomentRecord,
} from "@/types/moment";

export function useMoment(id: string, initialData?: MomentRecord | null) {
  return useQuery({
    queryKey: queryKeys.moments.detail(id),
    queryFn: () => getMoment(id),
    initialData: initialData ?? undefined,
    enabled: Boolean(id),
  });
}

export function useCreateMoment() {
  return useMutation({
    mutationFn: (payload: CreateMomentPayload) => createMoment(payload),
  });
}

export type { CreateMomentResponse };
