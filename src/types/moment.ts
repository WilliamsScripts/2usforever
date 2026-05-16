import { z } from "zod";

export const musicSchema = z.object({
  track_id: z.string().min(1),
  name: z.string().min(1),
  artist_name: z.string().min(1),
  spotify_url: z.string().url(),
  album_image: z.string().url().nullable(),
});

export const createMomentSchema = z.object({
  occasion: z.string().min(1, "Please select an occasion"),
  headline: z.string().trim().max(120).optional(),
  recipient: z.string().trim().min(1, "Their name is required"),
  message: z.string().trim().max(2000).optional(),
  sender: z.string().trim().max(120).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  music: musicSchema.optional(),
  template: z.string().min(1, "Please select a template"),
  sender_email: z
    .string()
    .trim()
    .min(1, "Your email is required")
    .email("Enter a valid email"),
  recipient_email: z
    .string()
    .email("Enter a valid email")
    .trim()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal(""))
    .or(z.null()),
  recipient_phone: z.string().trim().length(11, "Enter 11 digits for phone"),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
    .optional()
    .or(z.literal("")),
});

export type CreateMomentFormValues = z.infer<typeof createMomentSchema>;

export type MomentMusic = z.infer<typeof musicSchema>;

export type MomentRecord = {
  id: string;
  occasion: string | null;
  headline: string | null;
  recipient: string | null;
  sender: string | null;
  message: string | null;
  photos: string[] | null;
  music: MomentMusic | null;
  created_at: string;
  template: string;
  scheduled_date: string | null;
  sender_email?: string | null;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  status: MomentStatus;
  payment_status: MomentPaymentStatus;
};

export type MomentStatus = "draft" | "active";
export type MomentPaymentStatus = "pending" | "paid";

export type MomentData = {
  occasion?: string | null;
  headline?: string | null;
  message?: string | null;
  sender?: string | null;
  recipient?: string | null;
  photos?: string[] | null;
  template?: string | null;
  scheduled_date?: string | null;
  music?: {
    track_id?: string;
    name?: string;
    artist_name?: string;
    album_image?: string | null;
    spotify_url?: string;
  } | null;
  status: MomentStatus;
  payment_status: MomentPaymentStatus;
};

export type CreateMomentPayload = {
  occasion: string;
  headline?: string;
  recipient: string;
  message?: string;
  sender?: string;
  photos?: string[];
  music: MomentMusic | null;
  template: string;
  sender_email: string;
  recipient_email?: string | null;
  recipient_phone: string;
  scheduled_date: string | null;
};

export type CreateMomentResponse = {
  data: MomentRecord;
  authorization_url: string;
  payment_reference?: string;
};

export type GetMomentResponse = {
  data: MomentRecord;
};

export type DeliveryTiming = "immediate" | "scheduled";

export const OCCASIONS = [
  "💌 Love Note",
  "💍 Proposal",
  "💑 Anniversary",
  "🎂 Birthday",
  "✈️ Surprise Drop",
  "🎊 Apology",
  "🎄 Christmas",
  "💝 Valentine's Day",
  "🕌 Eid",
  "🙏 Thanksgiving",
  "🎓 Graduation",
  "🏠 New Home",
  "🤰 Baby on the Way",
  "🎉 Congratulations",
  "🌹 Mother's Day",
  "🦸 Father's Day",
  "💐 Get Well Soon",
  "🛫 Farewell",
  "👋 Welcome",
] as const;

export const BUILDER_STEP_LABELS = [
  "You",
  "Message",
  "Photos",
  "Song",
  "Template",
  "Preview",
] as const;

export const BUILDER_TOTAL_STEPS = BUILDER_STEP_LABELS.length;
