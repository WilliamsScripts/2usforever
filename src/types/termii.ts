export type TermiiSendWhatsappPayload = {
  to: string;
  from: string;
  sms: string;
  type: "plain";
  api_key: string;
  channel: "whatsapp";
};

export type TermiiSendResponse = {
  code: string;
  balance?: number;
  message_id?: string;
  message_id_str?: string;
  message: string;
  user?: string;
};

export type TermiiSendResult =
  | { ok: true; data: TermiiSendResponse }
  | { ok: false; error: Error };
