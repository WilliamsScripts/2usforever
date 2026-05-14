"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { TimelineFrame } from "@/components/timeline/TimelineFrame";
import { useRedirectIfAuthenticated } from "@/lib/auth/protected-route";

export function TimelineLogin() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/timeline";
  const authError = searchParams.get("error") === "auth";

  useRedirectIfAuthenticated({ redirectTo: next });

  useEffect(() => {
    if (!authError) return;
    toast.error("That sign-in session expired. Request a new code below.");
  }, [authError]);

  return (
    <TimelineFrame>
      <OtpLoginForm next={next} authError={authError} />
    </TimelineFrame>
  );
}
