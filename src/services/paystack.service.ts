import { getAppUrl } from "@/lib/supabase/env";

const PAYSTACK_API_BASE = "https://api.paystack.co";

export type PaystackInitializeResult = {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export function getMomentPriceKobo() {
  const fromEnv = process.env.PAYSTACK_MOMENT_AMOUNT_KOBO;
  if (fromEnv) {
    const parsed = Number.parseInt(fromEnv, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 500_000;
}

export async function initializePaystackTransaction({
  email,
  momentId,
  callbackUrl,
}: {
  email: string;
  momentId: string;
  callbackUrl?: string;
}): Promise<PaystackInitializeResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const amount = getMomentPriceKobo();
  const appUrl = getAppUrl();
  const resolvedCallback =
    callbackUrl ??
    `${appUrl}/create-moment?payment=success&moment_id=${encodeURIComponent(momentId)}`;

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url: resolvedCallback,
      metadata: {
        momentId,
      },
    }),
  });

  const payload = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    const message =
      payload.message || "Paystack could not start this payment session";
    throw new Error(message);
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
    accessCode: payload.data.access_code,
  };
}
