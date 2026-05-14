import type { Metadata } from "next";
import { TimelineDashboard } from "@/components/timeline/TimelineDashboard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Your Timeline",
  description: "View and manage every love moment you've sent and received.",
  path: "/timeline",
  noIndex: true,
});

export default function TimelinePage() {
  return <TimelineDashboard />;
}
