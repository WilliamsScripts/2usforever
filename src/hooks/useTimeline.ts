"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import {
  deleteTimelineMoment,
  getTimeline,
  updateTimelineMoment,
} from "@/services/timeline.service";
import type { UpdateTimelineMomentPayload } from "@/types/timeline";

export function useTimeline() {
  return useQuery({
    queryKey: queryKeys.timeline.all,
    queryFn: getTimeline,
  });
}

export function useUpdateTimelineMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTimelineMomentPayload;
    }) => updateTimelineMoment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useDeleteTimelineMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTimelineMoment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}
