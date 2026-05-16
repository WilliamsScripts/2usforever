"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
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

  useEffect(() => {
    posthog.capture("moment_viewed", {
      moment_id: data.id,
      occasion: data.occasion,
      template: data.template,
      is_scheduled: !!data.scheduled_date,
      has_music: !!data.music,
      has_photos: Array.isArray(data.photos) && data.photos.length > 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  if (!unlocked && data.scheduled_date) {
    return (
      <ScheduledCountdown
        scheduledDate={data.scheduled_date}
        recipient={data.recipient}
        headline={data.headline}
        template={data.template}
        onUnlocked={handleUnlocked}
      />
    );
  }

  return <MomentTemplate data={data} />;
}
