import "server-only";

function getAppBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://2usforever.com";
  return baseUrl.replace(/\/$/, "");
}

export const WHATSAPP_LOGO_SRC = `${getAppBaseUrl()}/whatsapp-logo.png`;
