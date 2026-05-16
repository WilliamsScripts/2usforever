import type { Metadata } from "next";
import { StatusScreen } from "@/components/status/StatusScreen";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Page not found",
  description: "This page could not be found on 2UsForever.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return <StatusScreen variant="not-found" />;
}
