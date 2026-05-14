import type { CreateMomentFormValues } from "@/types/moment";

export function buildMomentPreview(values: {
  occasion: string;
  headline: string;
  recipient: string;
  sender: string;
  message: string;
}) {
  const safeRecipient = values.recipient?.trim() || "";
  const safeSender = values.sender?.trim() || "";
  const safeMessage = values.message?.trim() || "";

  const slug = safeRecipient.toLowerCase().replace(/[^a-z0-9]/g, "");
  const title =
    values.headline.trim() ||
    `${values.occasion} for ${safeRecipient || "My Love"} ♡`;
  const url = `2usforever.com/for/${slug || "mylove"}`;
  const letter = safeMessage
    ? safeMessage + (safeSender ? `\n\n— ${safeSender}` : "")
    : `Dear ${safeRecipient || "my love"},\n\nYou came into my life and changed everything. Every moment with you feels like home.\n\nI just wanted you to know that you are seen, you are cherished, and you are deeply loved.\n\n${
        safeSender ? `— ${safeSender}` : "— Your person ♡"
      }`;

  return { title, url, letter };
}

export function buildCreateMomentPayload(
  values: CreateMomentFormValues,
  deliveryTiming: "immediate" | "scheduled",
) {
  return {
    ...values,
    template: values.template,
    photos: values.photos ?? [],
    scheduled_date:
      deliveryTiming === "scheduled" && values.scheduled_date
        ? values.scheduled_date
        : null,
    music: values.music
      ? {
          track_id: values.music.track_id,
          name: values.music.name,
          artist_name: values.music.artist_name,
          spotify_url: values.music.spotify_url,
          album_image: values.music.album_image,
        }
      : null,
  };
}

export function buildWhatsappShareUrl(
  recipientPhone: string,
  momentId: string,
): string {
  if (!recipientPhone || !/^\d{11}$/.test(recipientPhone)) return "";
  const phone = "234" + recipientPhone.slice(1);
  const momentUrl = `https://2usforever.vercel.app/for/${momentId}`;
  const shareText = `I created something special for you: ${momentUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(shareText)}`;
}
