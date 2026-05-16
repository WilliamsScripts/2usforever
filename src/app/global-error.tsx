"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/status/StatusScreen";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full antialiased">
        <StatusScreen variant="server-error" onRetry={reset} />
      </body>
    </html>
  );
}
