export type SenderConfirmationEmailProps = {
  senderName?: string | null;
  recipientName: string;
  occasion: string;
  momentUrl: string;
  timelineUrl: string;
  createMomentUrl: string;
  scheduledDate?: string | null;
  headline?: string | null;
  recipientPhone?: string | null;
  paymentCompleted?: boolean;
};

export type SenderPaymentPendingEmailProps = {
  recipientName: string;
  occasion: string;
  paymentUrl: string;
  timelineUrl: string;
  scheduledDate?: string | null;
};

export type RecipientMomentEmailProps = {
  recipientName: string;
  senderName?: string | null;
  occasion: string;
  momentUrl: string;
  timelineUrl: string;
  createMomentUrl: string;
  scheduledDate?: string | null;
  headline?: string | null;
};
