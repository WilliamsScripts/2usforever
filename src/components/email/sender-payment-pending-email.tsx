import type { SenderPaymentPendingEmailProps } from "@/types/email";
import {
  EmailButton,
  EmailLayout,
  EmailSecondaryButton,
  emailColors,
  formatScheduledLabel,
} from "./email-layout";

export function SenderPaymentPendingEmail({
  recipientName,
  occasion,
  paymentUrl,
  timelineUrl,
  scheduledDate,
}: SenderPaymentPendingEmailProps) {
  const scheduledLabel = formatScheduledLabel(scheduledDate);

  return (
    <EmailLayout
      preview={`Complete payment to publish your moment for ${recipientName}.`}
      eyebrow="Payment required"
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
        has been saved as a draft. Complete your payment to publish it and send
        the link to them.
      </p>

      <EmailButton href={paymentUrl} label="Complete payment" />
      <EmailSecondaryButton href={timelineUrl} label="See your timeline" />

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
          ? `After payment, their page unlocks at midnight on ${scheduledLabel}.`
          : "After payment, you can share their private link right away."}
      </p>
    </EmailLayout>
  );
}
