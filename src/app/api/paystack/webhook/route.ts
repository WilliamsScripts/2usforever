import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateMomentNotifications } from "@/services/moment-activation.service";
import type { MomentRecord } from "@/types/moment";

type PaystackWebhookEvent = {
  event: string;
  data?: {
    reference?: string;
    amount?: number;
    metadata?: {
      momentId?: string;
    };
  };
};

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

  const momentId = event.data?.metadata?.momentId;
  const reference = event.data?.reference;

  if (!momentId || !reference) {
    console.warn("[paystack webhook] missing momentId or reference", event);
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

  const { data: updated, error: updateError } = await supabase
    .from("moments")
    .update({
      payment_status: "paid",
      status: "active",
      payment_reference: reference,
    })
    .eq("id", momentId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error("[paystack webhook] failed to activate moment", updateError);
    return NextResponse.json(
      { error: "Failed to activate moment" },
      { status: 500 },
    );
  }

  try {
    await activateMomentNotifications(updated as MomentRecord);
  } catch (error) {
    console.error("[paystack webhook] notification delivery failed", error);
  }

  return new Response("OK", { status: 200 });
}
