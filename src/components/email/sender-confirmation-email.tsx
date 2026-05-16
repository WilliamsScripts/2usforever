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
  paymentCompleted = false,
}: SenderConfirmationEmailProps) {
  const scheduledLabel = formatScheduledLabel(scheduledDate);

  return (
    <EmailLayout
      preview={`Your moment for ${recipientName} is ready to share.`}
      eyebrow={paymentCompleted ? "Payment complete" : "Moment created"}
    >
      {paymentCompleted ? (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            lineHeight: 1.6,
            color: emailColors.rose,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Thank you — your payment was successful.
        </p>
      ) : null}
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
        {paymentCompleted
          ? "is live. Share the link whenever you're ready or send it straight to them on WhatsApp."
          : "has been saved. Share the link whenever you're ready or send it straight to them on WhatsApp."}
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
