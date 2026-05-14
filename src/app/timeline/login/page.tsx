import type { Metadata } from "next";
import { Suspense } from "react";
import { TimelineLogin } from "@/components/timeline/TimelineLogin";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In to Your Timeline",
  description:
    "Sign in with a one-time email code to view your private timeline of sent and received love moments on 2UsForever.",
  path: "/timeline/login",
  noIndex: true,
});

export default function TimelineLoginPage() {
  return (
    <Suspense fallback={null}>
      <TimelineLogin />
    </Suspense>
  );
}
