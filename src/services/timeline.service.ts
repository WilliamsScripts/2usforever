import { apiRequest } from "@/lib/api-client";
import type {
  TimelineResponse,
  UpdateTimelineMomentPayload,
  UpdateTimelineMomentResponse,
} from "@/types/timeline";

export async function getTimeline() {
  return apiRequest<TimelineResponse>("/api/timeline");
}

export async function updateTimelineMoment(
  id: string,
  payload: UpdateTimelineMomentPayload,
) {
  return apiRequest<UpdateTimelineMomentResponse>(`/api/timeline/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteTimelineMoment(id: string) {
  return apiRequest<{ ok: true }>(`/api/timeline/${id}`, {
    method: "DELETE",
  });
}
