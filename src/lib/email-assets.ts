const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
  : "";

export const WHATSAPP_LOGO_SRC = `${baseUrl}/static/whatsapp-logo.png`;
