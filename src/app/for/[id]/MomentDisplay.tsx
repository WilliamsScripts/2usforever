"use client";

import { useScheduledUnlock } from "@/hooks/useScheduledUnlock";
import type { MomentRecord } from "@/types/moment";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import FloralTemplate from "./templates/FloralTemplate";
import StarryTemplate from "./templates/StarryTemplate";
import ScheduledCountdown from "./ScheduledCountdown";

function MomentTemplate({ data }: { data: MomentRecord }) {
  switch (data.template) {
    case "modern":
      return <ModernTemplate data={data} />;
    case "floral":
      return <FloralTemplate data={data} />;
    case "starry":
      return <StarryTemplate data={data} />;
    default:
      return <ClassicTemplate data={data} />;
  }
}

export default function MomentDisplay({ data }: { data: MomentRecord }) {
  const { unlocked, handleUnlocked } = useScheduledUnlock(data.scheduled_date);

  if (!unlocked && data.scheduled_date) {
    return (
      <ScheduledCountdown
        scheduledDate={data.scheduled_date}
        recipient={data.recipient}
        headline={data.headline}
        onUnlocked={handleUnlocked}
      />
    );
  }

  return <MomentTemplate data={data} />;
}
