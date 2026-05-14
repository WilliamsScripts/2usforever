import type { SenderConfirmationEmailProps } from "@/types/email";
import {
  EmailButton,
  EmailLayout,
  EmailSecondaryButton,
  EmailUpsellBox,
  WhatsAppButton,
  emailColors,
  formatScheduledLabel,
} from "./email-layout";
import { buildWhatsappShareUrl } from "@/lib/moment-preview";

export function SenderConfirmationEmail({
  recipientName,
  occasion,
  momentUrl,
  timelineUrl,
  createMomentUrl,
  scheduledDate,
  recipientPhone,
}: SenderConfirmationEmailProps) {
  const scheduledLabel = formatScheduledLabel(scheduledDate);

  return (
    <EmailLayout
      preview={`Your moment for ${recipientName} is ready to share.`}
      eyebrow="Moment created"
    >
      <p
        style={{
          margin: "0 0 18px",
          fontSize: 16,
          lineHeight: 1.7,
          color: emailColors.textMid,
          textAlign: "center",
        }}
      >
        Your {occasion.toLowerCase()} page for{" "}
        <strong style={{ color: emailColors.textDark }}>{recipientName}</strong>{" "}
        has been saved. Share the link whenever you&apos;re ready or send it
        straight to them on WhatsApp.
      </p>

      <EmailButton href={momentUrl} label="View" />
      <EmailSecondaryButton href={timelineUrl} label="See your timeline" />
      {recipientPhone && momentUrl && (
        <WhatsAppButton
          href={buildWhatsappShareUrl(
            recipientPhone ?? "",
            momentUrl.split("/").pop() ?? "",
          )}
          label="Share on WhatsApp"
        />
      )}
      <p
        style={{
          margin: "18px 0 0",
          fontSize: 13,
          lineHeight: 1.6,
          color: emailColors.textSoft,
          textAlign: "center",
        }}
      >
        {scheduledLabel
          ? `Their page unlocks at midnight on ${scheduledLabel}.`
          : "They can open it as soon as you share the link."}
      </p>

      <EmailUpsellBox
        title="Keep the love going"
        body="Create another beautiful moment in minutes — a birthday surprise, anniversary note, or just because."
        ctaHref={createMomentUrl}
        ctaLabel="Create a moment now"
      />
    </EmailLayout>
  );
}
