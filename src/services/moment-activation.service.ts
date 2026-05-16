import { sendMomentEmails } from "@/services/email.service";
import { sendMomentWhatsapp } from "@/services/termii.service";
import { getPostHogClient } from "@/lib/posthog-server";
import type { MomentRecord } from "@/types/moment";

export async function activateMomentNotifications(moment: MomentRecord) {
  const senderEmail = moment.sender_email?.trim();
  if (!senderEmail) {
    throw new Error("Moment is missing sender email");
  }

  const [{ senderResult, recipientResult }, whatsappResult] =
    await Promise.all([
      sendMomentEmails({
        moment,
        senderEmail,
        recipientEmail: moment.recipient_email,
        paymentCompleted: true,
      }),
      sendMomentWhatsapp({
        moment,
        recipientPhone: moment.recipient_phone ?? "",
      }),
    ]);

  if (senderResult.error) {
    throw new Error(senderResult.error.message);
  }

  if (recipientResult?.error) {
    console.warn("[moment activation] recipient email error", recipientResult.error);
  }

  if (whatsappResult === null) {
    console.log("[moment activation] whatsapp not sent: invalid phone");
  } else if (!whatsappResult.ok) {
    console.warn("[moment activation] whatsapp failed", whatsappResult.error);
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: senderEmail,
    event: "server_moment_activated",
    properties: {
      moment_id: moment.id,
      occasion: moment.occasion,
      email_sent: !senderResult.error,
      whatsapp_sent: whatsappResult?.ok === true,
      has_recipient_email: !!moment.recipient_email?.trim(),
    },
  });

  return { senderResult, recipientResult, whatsappResult };
}
