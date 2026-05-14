import type { RecipientMomentEmailProps } from "@/types/email";
import {
  EmailButton,
  EmailLayout,
  EmailSecondaryButton,
  EmailUpsellBox,
  emailColors,
  formatScheduledLabel,
} from "./email-layout";

export function RecipientMomentEmail({
  recipientName,
  senderName,
  occasion,
  momentUrl,
  timelineUrl,
  createMomentUrl,
  scheduledDate,
  headline,
}: RecipientMomentEmailProps) {
  const scheduledLabel = formatScheduledLabel(scheduledDate);
  const fromLabel = senderName?.trim() || "Someone who loves you";
  const title =
    headline?.trim() ||
    `Something special is waiting for you, ${recipientName}`;

  return (
    <EmailLayout
      preview={`${fromLabel} created a ${occasion} moment just for you.`}
      eyebrow="A moment for you"
      title={title}
    >
      {!headline && (
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 16,
            lineHeight: 1.7,
            color: emailColors.textMid,
          }}
        >
          Hi {recipientName},
        </p>
      )}

      <p
        style={{
          margin: "0 0 18px",
          fontSize: 16,
          lineHeight: 1.7,
          color: emailColors.textMid,
        }}
      >
        <strong style={{ color: emailColors.textDark }}>{fromLabel}</strong>{" "}
        made a beautiful private page on 2UsForever for you.
      </p>

      <div
        style={{
          margin: "0 0 8px",
          padding: "18px 20px",
          borderRadius: 14,
          backgroundColor: emailColors.blush,
          border: `1px solid ${emailColors.border}`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: emailColors.textSoft,
          }}
        >
          {scheduledLabel ? "Opens on" : "Ready for you"}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily:
              "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
            fontSize: 22,
            color: emailColors.roseDeep,
          }}
        >
          {scheduledLabel ?? "Open whenever your heart is ready ♡"}
        </p>
      </div>

      <EmailButton
        href={momentUrl}
        label={scheduledLabel ? "See what's coming" : "Open your moment"}
      />
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
          ? "The full message unlocks at midnight on the date above."
          : "This link was made just for you. Take your time."}
      </p>

      <EmailUpsellBox
        title="Reply with your own moment"
        body="Surprise someone you love with a private page of your own — photos, music, and words from the heart."
        ctaHref={createMomentUrl}
        ctaLabel="Create a moment now"
      />
    </EmailLayout>
  );
}
