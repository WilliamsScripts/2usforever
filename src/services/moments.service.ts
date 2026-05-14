import {
  apiRequest,
  ApiError,
  resolveApiUrl,
} from "@/lib/api-client";
import type {
  CreateMomentPayload,
  CreateMomentResponse,
  GetMomentResponse,
  MomentRecord,
} from "@/types/moment";

export async function getMoment(
  id: string,
  baseUrl?: string,
): Promise<MomentRecord | null> {
  try {
    const { data } = await apiRequest<GetMomentResponse>(
      resolveApiUrl(`/api/moments?id=${encodeURIComponent(id)}`, baseUrl),
      { cache: "no-store" },
    );
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createMoment(
  payload: CreateMomentPayload,
): Promise<MomentRecord> {
  const { data } = await apiRequest<CreateMomentResponse>("/api/moments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data;
}
