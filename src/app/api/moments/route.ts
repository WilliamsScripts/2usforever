import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

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
  photos: z.array(z.string().url()).max(8).optional(),
  music: musicSchema.optional().nullable(),
  sender_email: z.string().trim().min(1),
  recipient_email: z.string().trim().max(120).optional().nullable(),
  recipient_phone: z.string().trim().length(11),
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
        sender_email: payload.sender_email,
        recipient_email: payload.recipient_email ?? "",
        recipient_phone: payload.recipient_phone,
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

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "2usforever <onboarding@resend.dev>",
      to: ["williamscherechiwilliams@gmail.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "John" }),
    });

    if (emailError) {
      console.log("error", emailError);
      return NextResponse.json(
        {
          error: "Failed to create moment record",
          details: emailError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ data, emailData }, { status: 201 });
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
