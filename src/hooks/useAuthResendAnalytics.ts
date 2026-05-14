"use client";

import { useCallback, useRef } from "react";
import type { ResendAnalyticsHandler } from "@/types/auth";

export function useAuthResendAnalytics(
  onEvent?: ResendAnalyticsHandler,
): ResendAnalyticsHandler {
  const attemptRef = useRef(0);

  return useCallback<ResendAnalyticsHandler>(
    (event, metadata) => {
      if (event === "otp_sent" || event === "otp_resent") {
        attemptRef.current += 1;
      }

      onEvent?.(event, {
        ...metadata,
        attempt: attemptRef.current,
      });
    },
    [onEvent],
  );
}
