import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateMomentSchema = z.object({
  occasion: z.string().min(1).optional(),
  headline: z.string().trim().max(120).optional().nullable(),
  recipient: z.string().trim().min(1).optional(),
  sender: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  template: z.string().min(1).optional(),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getAuthorizedMoment(id: string, email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return { error: "Moment not found", status: 404 as const };
  }

  if (normalizeEmail(String(data.sender_email ?? "")) !== email) {
    return { error: "You can only edit moments you created", status: 403 as const };
  }

  return { data, supabase };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = normalizeEmail(user.email);
    const authorized = await getAuthorizedMoment(id, email);

    if ("error" in authorized) {
      return NextResponse.json(
        { error: authorized.error },
        { status: authorized.status },
      );
    }

    const body = await request.json();
    const parsed = updateMomentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { data, error } = await authorized.supabase
      .from("moments")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update moment", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = normalizeEmail(user.email);
    const authorized = await getAuthorizedMoment(id, email);

    if ("error" in authorized) {
      return NextResponse.json(
        { error: authorized.error },
        { status: authorized.status },
      );
    }

    const { error } = await authorized.supabase
      .from("moments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete moment", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
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
