"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CaptchaHandle = {
  reset: () => void;
  getToken: () => string | null;
};

type CaptchaProps = {
  onTokenChange?: (token: string | null) => void;
  className?: string;
  ref?: React.Ref<CaptchaHandle>;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isCaptchaEnabled(): boolean {
  return Boolean(siteKey);
}

export function Captcha({ onTokenChange, className, ref }: CaptchaProps) {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const updateToken = useCallback(
    (nextToken: string | null) => {
      setToken(nextToken);
      onTokenChange?.(nextToken);
    },
    [onTokenChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        turnstileRef.current?.reset();
        updateToken(null);
      },
      getToken: () => token,
    }),
    [token, updateToken],
  );

  if (!siteKey) {
    return null;
  }

  return (
    <div
      className={cn("flex justify-center", className)}
      aria-label="Security verification"
    >
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={updateToken}
        onExpire={() => updateToken(null)}
        onError={() => updateToken(null)}
        options={{ theme: "light", size: "flexible" }}
      />
    </div>
  );
}
