import type { Metadata } from "next";
import { getAppUrl } from "@/lib/supabase/env";

export const SITE_NAME = "2UsForever";

export const SITE_DESCRIPTION =
  "Create a beautiful personalised love page with your words, photos and Spotify song in minutes. Perfect for anniversaries, proposals, birthdays and surprises — shared via WhatsApp, remembered forever.";

export const SITE_KEYWORDS = [
  "love letter",
  "personalised gift",
  "anniversary gift",
  "proposal surprise",
  "romantic surprise",
  "digital love note",
  "Spotify love page",
  "WhatsApp gift",
  "long distance relationship",
  "birthday surprise",
  "love page creator",
];

const siteUrl = getAppUrl();

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Create a Beautiful Love Moment They'll Never Forget`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "lifestyle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Create a Beautiful Love Moment They'll Never Forget`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Create a Beautiful Love Moment They'll Never Forget`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : undefined,
  };
}

export const homeMetadata: Metadata = {
  ...createPageMetadata({
    title: "Create a Beautiful Love Moment They'll Never Forget",
    description:
      "A personalised love page in minutes with your words, photos and song. The perfect romantic surprise for any special occasion.",

    path: "/",
    keywords: [
      ...SITE_KEYWORDS,
      "create love page",
      "romantic website",
      "surprise gift online",
      "AI love letter",
    ],
  }),
  openGraph: {
    title: "2UsForever — They'll Open a Link. They'll Feel Everything.",
    description:
      "A personalised love page with your words, photos and Spotify song. Built in minutes. Remembered forever.",
    url: siteUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "2UsForever — They'll Open a Link. They'll Feel Everything.",
    description:
      "A personalised love page with your words, photos and Spotify song. Built in minutes. Remembered forever.",
  },
};

export function getHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        name: SITE_NAME,
        url: siteUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "5.00",
          priceCurrency: "USD",
          description: "One-time payment per love moment",
        },
      },
    ],
  };
}
