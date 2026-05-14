import type { MomentRecord } from "@/types/moment";

export type TimelineDirection = "sent" | "received";

export type TimelineMoment = MomentRecord & {
  direction: TimelineDirection;
};

export type TimelineResponse = {
  data: TimelineMoment[];
  email: string;
};

export type UpdateTimelineMomentPayload = {
  occasion?: string;
  headline?: string | null;
  recipient?: string;
  sender?: string | null;
  message?: string | null;
  scheduled_date?: string | null;
  template?: string;
};

export type UpdateTimelineMomentResponse = {
  data: MomentRecord;
};
