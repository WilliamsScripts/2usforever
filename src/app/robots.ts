import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/supabase/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create-moment"],
        disallow: ["/api/", "/timeline", "/for/", "/auth/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
