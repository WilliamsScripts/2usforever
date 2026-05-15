"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Captcha,
  isCaptchaEnabled,
  type CaptchaHandle,
} from "@/components/auth/Captcha";
import { OTP_LENGTH, OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOtpLogin } from "@/hooks/useOtpLogin";
import { isDeviceRemembered } from "@/lib/auth/remember-device";
import { cn } from "@/lib/utils";

type OtpLoginFormProps = {
  next: string;
  authError?: boolean;
};

export function OtpLoginForm({ next, authError = false }: OtpLoginFormProps) {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);

  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    isSending,
    isVerifying,
    isSubmitting,
    cooldownLabel,
    isResendDisabled,
    handleSendCode,
    handleVerifyCode,
    handleResend,
    resetToEmailStep,
    otpInvalid,
  } = useOtpLogin({
    next,
    captchaToken,
    rememberDevice,
    onCaptchaReset: () => captchaRef.current?.reset(),
  });

  const captchaRequired =
    isCaptchaEnabled() && !isDeviceRemembered(email) && step === "email";

  const onSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleSendCode();
  };

  const onVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleVerifyCode();
  };

  const onResend = async () => {
    if (isResendDisabled) {
      if (cooldownLabel) toast.message(cooldownLabel);
      return;
    }
    await handleResend();
  };

  return (
    <section className="timeline-login">
      <p className="timeline-eyebrow">Private & secure</p>
      <h1 className="timeline-title">Your timeline awaits</h1>
      <p className="timeline-subtitle">
        Sign in with the same email you used when creating or receiving a
        moment. We&apos;ll email you a one-time code - no password needed.
      </p>

      {authError ? (
        <p className="timeline-login-error" role="alert">
          That sign-in session expired. Enter your email and request a new code
          below.
        </p>
      ) : null}

      {step === "code" ? (
        <form onSubmit={onVerifyCode} className="timeline-login-form">
          <div className="timeline-login-sent">
            <p className="timeline-login-sent-title">Enter your code</p>
            <p>
              We sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="otp-code" className="sr-only">
              Sign-in code
            </Label>
            <OtpInput
              id="otp-code"
              value={code}
              onChange={setCode}
              disabled={isVerifying}
              invalid={otpInvalid}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className={cn(
              "timeline-login-submit mt-4 h-11 w-full rounded-full border-0 bg-[color:var(--rose)] text-base font-medium text-white hover:bg-[color:var(--rose-deep)]",
            )}
            disabled={isVerifying || code.length !== OTP_LENGTH || isSubmitting}
          >
            {isVerifying ? "Verifying…" : "Sign in"}
          </Button>

          <div className="timeline-login-actions">
            <button
              type="button"
              className="timeline-retry"
              onClick={onResend}
              disabled={isResendDisabled}
              aria-live="polite"
            >
              {cooldownLabel ?? "Resend code"}
            </button>
            <button
              type="button"
              className="timeline-retry timeline-retry--ghost"
              onClick={resetToEmailStep}
              disabled={isSubmitting}
            >
              Use a different email
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onSendCode} className="timeline-login-form">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="timeline-input h-11 rounded-xl border-[color:var(--rose-light)] bg-white px-4 text-base"
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isSending}
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-[color:var(--text-mid)]">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              className="size-4 rounded border-[color:var(--rose-light)] accent-[color:var(--rose)]"
            />
            Remember this device for 30 days
          </label>

          {captchaRequired ? (
            <Captcha
              ref={captchaRef}
              className="mt-4"
              onTokenChange={setCaptchaToken}
            />
          ) : null}

          <Button
            type="submit"
            className="timeline-login-submit mt-4 h-11 w-full rounded-full border-0 bg-[color:var(--rose)] text-base font-medium text-white hover:bg-[color:var(--rose-deep)]"
            disabled={
              isSending || isSubmitting || (captchaRequired && !captchaToken)
            }
          >
            {isSending ? "Sending…" : "Send sign-in code"}
          </Button>
        </form>
      )}

      <p className="timeline-login-footnote">
        New here?{" "}
        <Link href="/create-moment" className="timeline-login-link">
          Create your first moment
        </Link>
      </p>
    </section>
  );
}
