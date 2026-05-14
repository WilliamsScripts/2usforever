import { Suspense } from "react";
import { TimelineLogin } from "@/components/timeline/TimelineLogin";

export default function TimelineLoginPage() {
  return (
    <Suspense fallback={null}>
      <TimelineLogin />
    </Suspense>
  );
}
