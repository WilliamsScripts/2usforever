import type { Metadata } from "next";
import { Suspense } from "react";
import LandingFrame from "@/components/landing/LandingFrame";
import CreateMomentBuilder from "@/components/landing/CreateMomentBuilder";
import { createPageMetadata, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create a Love Page | Build a Beautiful Surprise in Minutes",
  description:
    "Build your personalised love page in minutes with your words, photos and song. The perfect romantic surprise for any special occasion.",
  path: "/create-moment",
  keywords: [
    ...SITE_KEYWORDS,
    "create love page",
    "personalised love letter",
    "romantic gift builder",
    "Spotify love page",
    "anniversary page creator",
  ],
});

export default function CreateMomentPage() {
  return (
    <LandingFrame ctaHref="/create-moment">
      <Suspense fallback={null}>
        <CreateMomentBuilder />
      </Suspense>
    </LandingFrame>
  );
}
