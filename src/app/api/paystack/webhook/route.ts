import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMomentEmails } from "@/services/email.service";
import { sendMomentWhatsapp } from "@/services/termii.service";
import type { MomentRecord } from "@/types/moment";

type PaystackWebhookEvent = {
  event: string;
  data?: {
    reference?: string;
    metadata?: unknown;
  };
};

function extractMomentId(metadata: unknown): string | null {
  if (metadata == null) return null;

  let parsed: unknown = metadata;
  if (typeof metadata === "string") {
    try {
      parsed = JSON.parse(metadata) as unknown;
    } catch {
      return null;
    }
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const momentId = (parsed as Record<string, unknown>).momentId;
  if (typeof momentId === "string" && momentId.trim()) {
    return momentId.trim();
  }

  return null;
}

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return new Response("Paystack is not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  if (!signature || hash !== signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (event.event !== "charge.success") {
    return new Response("OK", { status: 200 });
  }

  const momentId = extractMomentId(event.data?.metadata);
  const reference = event.data?.reference;

  if (!momentId || !reference) {
    console.warn("[paystack webhook] missing momentId or reference", {
      metadata: event.data?.metadata,
      reference,
    });
    return new Response("OK", { status: 200 });
  }

  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("moments")
    .select("*")
    .eq("id", momentId)
    .single();

  if (fetchError || !existing) {
    console.error("[paystack webhook] moment not found", momentId, fetchError);
    return new Response("OK", { status: 200 });
  }

  if (existing.payment_status === "paid" && existing.status === "active") {
    return new Response("OK", { status: 200 });
  }

  const { data, error: updateError } = await supabase
    .from("moments")
    .update({
      payment_status: "paid",
      status: "active",
      payment_reference: reference,
    })
    .eq("id", momentId)
    .select()
    .single();

  if (updateError || !data) {
    console.error("[paystack webhook] failed to activate moment", updateError);
    return NextResponse.json(
      { error: "Failed to activate moment" },
      { status: 500 },
    );
  }

  const moment = data as MomentRecord;
  const senderEmail = moment.sender_email?.trim();

  if (!senderEmail) {
    console.error("[paystack webhook] moment missing sender email", momentId);
    return new Response("OK", { status: 200 });
  }

  const [{ senderResult, recipientResult }, whatsappResult] = await Promise.all([
    sendMomentEmails({
      moment,
      senderEmail,
      recipientEmail: moment.recipient_email,
      paymentCompleted: true,
    }),
    sendMomentWhatsapp({
      moment,
      recipientPhone: moment.recipient_phone ?? "",
    }),
  ]);

  if (senderResult.error) {
    console.log("sender email error", senderResult.error);
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: senderResult.error.message,
      },
      { status: 500 },
    );
  }

  if (recipientResult?.error) {
    console.warn("recipient email error", recipientResult.error);
  }

  if (whatsappResult === null) {
    console.log("[termii whatsapp] not sent: no valid recipient phone");
  } else if (!whatsappResult.ok) {
    console.warn("[termii whatsapp] delivery failed", whatsappResult.error);
  } else {
    console.log("[termii whatsapp] delivery confirmed", whatsappResult.data);
  }

  return new Response("OK", { status: 200 });
}
