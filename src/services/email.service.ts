import { Resend } from "resend";
import { SenderConfirmationEmail } from "@/components/email/sender-confirmation-email";
import { RecipientMomentEmail } from "@/components/email/recipient-moment-email";
import type { MomentRecord } from "@/types/moment";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "2usforever <onboarding@resend.dev>";

function getMomentUrl(momentId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.vercel.app";
  return `${baseUrl.replace(/\/$/, "")}/for/${momentId}`;
}

type SendMomentEmailsInput = {
  moment: MomentRecord;
  senderEmail: string;
  recipientEmail?: string | null;
};

export async function sendMomentEmails({
  moment,
  senderEmail,
  recipientEmail,
}: SendMomentEmailsInput) {
  const momentUrl = getMomentUrl(moment.id);
  const emailProps = {
    recipientName: moment.recipient ?? "you",
    senderName: moment.sender,
    occasion: moment.occasion ?? "Love Note",
    momentUrl,
    scheduledDate: moment.scheduled_date,
    headline: moment.headline,
    recipientPhone: moment.recipient_phone,
  };

  const senderResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [senderEmail],
    subject: `Your ${emailProps.occasion.toLowerCase()} page for ${emailProps.recipientName} is ready`,
    react: SenderConfirmationEmail(emailProps),
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
