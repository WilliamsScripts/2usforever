export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-3TGKFF24T5";

export const isAnalyticsEnabled =
  Boolean(GA_MEASUREMENT_ID) &&
  (process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_GA_DEBUG === "true");
