export type GenerateMessagePayload = {
  occasion: string;
  headline?: string;
  sender?: string;
  recipient?: string;
};

export type ImproveMessagePayload = {
  occasion: string;
  message: string;
  headline?: string;
  sender?: string;
  recipient?: string;
};

export type GeminiMessageResponse = {
  message: string;
};
