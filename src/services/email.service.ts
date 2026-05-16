import { Resend } from "resend";
import { SenderConfirmationEmail } from "@/components/email/sender-confirmation-email";
import { SenderPaymentPendingEmail } from "@/components/email/sender-payment-pending-email";
import { RecipientMomentEmail } from "@/components/email/recipient-moment-email";
import type { MomentRecord } from "@/types/moment";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "2usforever <noreply@love.2usforever.com>";

function getMomentUrl(momentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.com";
  return `${baseUrl.replace(/\/$/, "")}/for/${momentId}`;
}

function getTimelineUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.com";
  return `${baseUrl.replace(/\/$/, "")}/timeline/login`;
}

function getCreateMomentUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.com";
  return `${baseUrl.replace(/\/$/, "")}/create-moment`;
}

function buildEmailProps(moment: MomentRecord) {
  return {
    recipientName: moment.recipient ?? "you",
    senderName: moment.sender,
    occasion: moment.occasion ?? "Love Note",
    momentUrl: getMomentUrl(moment.id),
    timelineUrl: getTimelineUrl(),
    createMomentUrl: getCreateMomentUrl(),
    scheduledDate: moment.scheduled_date,
    headline: moment.headline,
    recipientPhone: moment.recipient_phone,
  };
}

type SendPaymentPendingEmailInput = {
  moment: MomentRecord;
  senderEmail: string;
  paymentUrl: string;
};

export async function sendPaymentPendingEmail({
  moment,
  senderEmail,
  paymentUrl,
}: SendPaymentPendingEmailInput) {
  const emailProps = buildEmailProps(moment);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: [senderEmail],
    subject: `Complete payment for your ${emailProps.occasion.toLowerCase()} page`,
    react: SenderPaymentPendingEmail({
      recipientName: emailProps.recipientName,
      occasion: emailProps.occasion,
      paymentUrl,
      timelineUrl: emailProps.timelineUrl,
      scheduledDate: emailProps.scheduledDate,
    }),
  });
}

type SendMomentEmailsInput = {
  moment: MomentRecord;
  senderEmail: string;
  recipientEmail?: string | null;
  paymentCompleted?: boolean;
};

export async function sendMomentEmails({
  moment,
  senderEmail,
  recipientEmail,
  paymentCompleted = false,
}: SendMomentEmailsInput) {
  const emailProps = buildEmailProps(moment);

  const senderResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [senderEmail],
    subject: paymentCompleted
      ? `Payment received — your ${emailProps.occasion.toLowerCase()} page for ${emailProps.recipientName} is live`
      : `Your ${emailProps.occasion.toLowerCase()} page for ${emailProps.recipientName} is ready`,
    react: SenderConfirmationEmail({
      ...emailProps,
      paymentCompleted,
    }),
  });

  if (senderResult.error) {
    return { senderResult, recipientResult: null };
  }

  const trimmedRecipientEmail = recipientEmail?.trim();
  if (!trimmedRecipientEmail) {
    return { senderResult, recipientResult: null };
  }

  const recipientResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [trimmedRecipientEmail],
    subject: `${emailProps.senderName?.trim() || "Someone special"} made something for you`,
    react: RecipientMomentEmail(emailProps),
  });

  return { senderResult, recipientResult };
}
