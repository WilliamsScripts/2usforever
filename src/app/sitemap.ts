import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/supabase/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getAppUrl();
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/create-moment`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
