"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/status/StatusScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return <StatusScreen variant="server-error" onRetry={reset} />;
}
