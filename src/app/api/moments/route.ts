import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendMomentEmails } from "@/services/email.service";
import { sendMomentWhatsapp } from "@/services/termii.service";
import { getPostHogClient } from "@/lib/posthog-server";

const musicSchema = z.object({
  track_id: z.string().min(1),
  name: z.string().min(1),
  artist_name: z.string().min(1),
  spotify_url: z.string().url(),
  album_image: z.string().url().nullable(),
});

const createMomentSchema = z.object({
  occasion: z.string().min(1),
  headline: z.string().trim().max(120).optional().nullable(),
  recipient: z.string().trim().min(1),
  sender: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  photos: z.array(z.string().url()).max(5).optional(),
  music: musicSchema.optional().nullable(),
  template: z.string().optional().nullable(),
  sender_email: z.string().trim().min(1),
  recipient_email: z.string().trim().max(120).optional().nullable(),
  recipient_phone: z.string().trim().length(11),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .optional()
    .nullable(),
});

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMomentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid moment payload",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("moments")
      .insert({
        occasion: payload.occasion,
        headline: payload.headline ?? null,
        recipient: payload.recipient,
        sender: payload.sender ?? null,
        message: payload.message ?? null,
        photos: payload.photos ?? [],
        music: payload.music ?? null,
        template: payload.template ?? "classic",
        sender_email: payload.sender_email,
        recipient_email: payload.recipient_email ?? "",
        recipient_phone: payload.recipient_phone,
        scheduled_date: payload.scheduled_date ?? null,
      })
      .select()
      .single();

    if (error) {
      console.log("error", error);
      return NextResponse.json(
        { error: "Failed to create moment record", details: error.message },
        { status: 500 },
      );
    }

    const [{ senderResult, recipientResult }, whatsappResult] =
      await Promise.all([
        sendMomentEmails({
          moment: data,
          senderEmail: payload.sender_email,
          recipientEmail: payload.recipient_email,
        }),
        sendMomentWhatsapp({
          moment: data,
          recipientPhone: payload.recipient_phone,
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

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: payload.sender_email,
      event: "server_moment_created",
      properties: {
        moment_id: data.id,
        occasion: payload.occasion,
        template: payload.template ?? "classic",
        has_music: !!payload.music,
        has_photos: (payload.photos?.length ?? 0) > 0,
        has_recipient_email: !!payload.recipient_email?.trim(),
        is_scheduled: !!payload.scheduled_date,
        email_sent: !senderResult.error,
        whatsapp_sent: whatsappResult?.ok === true,
      },
    });

    return NextResponse.json(
      {
        data,
        emailData: {
          sender: senderResult.data,
          recipient: recipientResult?.data ?? null,
        },
        whatsappData: whatsappResult?.ok ? whatsappResult.data : null,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        {
          error: "Moment ID is required in the query",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("error", error);
      return NextResponse.json(
        { error: "Failed to create moment record", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
