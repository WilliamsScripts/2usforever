import type { MomentRecord } from "@/types/moment";
import type {
  TermiiSendResponse,
  TermiiSendResult,
  TermiiSendWhatsappPayload,
} from "@/types/termii";

const TERMII_BASE_URL =
  process.env.TERMII_BASE_URL ?? "https://api.ng.termii.com";
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_WHATSAPP_FROM = process.env.TERMII_WHATSAPP_FROM ?? "2usforever";

function getMomentUrl(momentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.com";
  return `${baseUrl.replace(/\/$/, "")}/for/${momentId}`;
}

export function toInternationalNigerianPhone(localPhone: string): string {
  return `234${localPhone.slice(1)}`;
}

export function isValidLocalPhone(phone: string | null | undefined): boolean {
  return Boolean(phone?.trim() && /^\d{11}$/.test(phone.trim()));
}

function buildRecipientWhatsappMessage(
  moment: MomentRecord,
  momentUrl: string,
) {
  const recipientName = moment.recipient?.trim() || "there";
  const senderName = moment.sender?.trim() || "Someone special";

  return `Hi ${recipientName},\n\n${senderName} made a private special page for you on 2UsForever.\n\nOpen it here: ${momentUrl}`;
}

export async function sendWhatsappMessage(
  payload: Omit<TermiiSendWhatsappPayload, "api_key" | "channel" | "type">,
): Promise<TermiiSendResult> {
  if (!TERMII_API_KEY) {
    console.warn("[termii whatsapp] skipped: TERMII_API_KEY is not configured");
    return {
      ok: false,
      error: new Error("Termii API key is not configured"),
    };
  }

  const body: TermiiSendWhatsappPayload = {
    ...payload,
    type: "plain",
    channel: "whatsapp",
    api_key: TERMII_API_KEY,
  };

  const requestLog = {
    url: `${TERMII_BASE_URL}/api/sms/send`,
    to: body.to,
    from: body.from,
    channel: body.channel,
    type: body.type,
    smsLength: body.sms.length,
  };

  console.log("[termii whatsapp] sending", requestLog);

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    let data: TermiiSendResponse | { message?: string } | null = null;

    try {
      data = rawText ? (JSON.parse(rawText) as TermiiSendResponse) : null;
    } catch {
      data = null;
    }

    console.log("[termii whatsapp] response", {
      status: response.status,
      ok: response.ok,
      body: data ?? rawText,
    });

    if (!response.ok) {
      const message =
        data && "message" in data && data.message
          ? data.message
          : rawText || `Termii request failed with status ${response.status}`;
      return { ok: false, error: new Error(message) };
    }

    if (!data || !("code" in data) || data.code !== "ok") {
      const message =
        data && "message" in data && data.message
          ? data.message
          : rawText || "Termii did not confirm the WhatsApp message was sent";
      return { ok: false, error: new Error(message) };
    }

    console.log("[termii whatsapp] sent", {
      messageId: data.message_id_str ?? data.message_id,
      balance: data.balance,
      message: data.message,
    });

    return { ok: true, data };
  } catch (error) {
    console.error("[termii whatsapp] request failed", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to send WhatsApp message via Termii"),
    };
  }
}

type SendMomentWhatsappInput = {
  moment: MomentRecord;
  recipientPhone: string;
};

export async function sendMomentWhatsapp({
  moment,
  recipientPhone,
}: SendMomentWhatsappInput): Promise<TermiiSendResult | null> {
  const trimmedPhone = recipientPhone.trim();
  if (!isValidLocalPhone(trimmedPhone)) {
    console.log("[termii whatsapp] skipped: invalid recipient phone", {
      recipientPhone,
    });
    return null;
  }

  const momentUrl = getMomentUrl(moment.id);
  const sms = buildRecipientWhatsappMessage(moment, momentUrl);

  return sendWhatsappMessage({
    to: toInternationalNigerianPhone(trimmedPhone),
    from: TERMII_WHATSAPP_FROM,
    sms,
  });
}
