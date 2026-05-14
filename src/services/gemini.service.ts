import { apiRequest } from "@/lib/api-client";
import type {
  GeminiMessageResponse,
  GenerateMessagePayload,
  ImproveMessagePayload,
} from "@/types/gemini";

export async function generateMessage(
  payload: GenerateMessagePayload,
): Promise<string> {
  const { message } = await apiRequest<GeminiMessageResponse>(
    "/api/gemini/generate-message",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return message;
}

export async function improveMessage(
  payload: ImproveMessagePayload,
): Promise<string> {
  const { message } = await apiRequest<GeminiMessageResponse>(
    "/api/gemini/improve-message",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return message;
}
