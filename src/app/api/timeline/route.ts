import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TimelineDirection, TimelineMoment } from "@/types/timeline";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function withDirection(
  moment: Record<string, unknown>,
  email: string,
): TimelineMoment {
  const senderEmail = String(moment.sender_email ?? "").toLowerCase();
  const direction: TimelineDirection =
    senderEmail === email ? "sent" : "received";

  return {
    ...(moment as TimelineMoment),
    direction,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = normalizeEmail(user.email);
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .or(`sender_email.eq.${email},recipient_email.eq.${email}`)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load timeline", details: error.message },
        { status: 500 },
      );
    }

    const timeline = (data ?? []).map((moment) => withDirection(moment, email));

    return NextResponse.json({ data: timeline, email });
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
