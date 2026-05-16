"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import posthog from "posthog-js";
import { isCaptchaEnabled } from "@/components/auth/Captcha";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { useAuthResendAnalytics } from "@/hooks/useAuthResendAnalytics";
import { useCooldown } from "@/hooks/useCooldown";
import { parseAuthError } from "@/lib/auth/errors";
import { OTP_LENGTH } from "@/lib/auth/otp";
import { isDeviceRemembered } from "@/lib/auth/remember-device";

type LoginStep = "email" | "code";

type UseOtpLoginOptions = {
  next: string;
  captchaToken?: string | null;
  rememberDevice?: boolean;
  onCaptchaReset?: () => void;
};

export function useOtpLogin({
  next,
  captchaToken,
  rememberDevice = false,
  onCaptchaReset,
}: UseOtpLoginOptions) {
  const router = useRouter();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const trackResend = useAuthResendAnalytics();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpInvalid, setOtpInvalid] = useState(false);
  const [hasSentOnce, setHasSentOnce] = useState(false);

  const cooldownScope = email.trim().toLowerCase() || "anonymous";

  const { startCooldown, label: cooldownLabel, isCoolingDown } = useCooldown({
    scope: cooldownScope,
  });

  const isSending = sendOtpMutation.isPending;
  const isVerifying = verifyOtpMutation.isPending;
  const isSubmitting = isSending || isVerifying;
  const isResendDisabled = isSending || isCoolingDown;

  const runSendOtp = useCallback(
    async (isResend: boolean) => {
      if (isSending || (isResend && isCoolingDown)) {
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        toast.error("Enter your email address.");
        return;
      }

      const captchaRequired =
        isCaptchaEnabled() && !isDeviceRemembered(normalizedEmail);

      if (captchaRequired && !captchaToken) {
        toast.error("Complete the security check before continuing.");
        return;
      }

      try {
        await sendOtpMutation.mutateAsync({
          email: normalizedEmail,
          captchaToken: captchaToken ?? undefined,
          rememberDevice,
        });

        setEmail(normalizedEmail);
        setStep("code");
        setCode("");
        setOtpInvalid(false);
        setHasSentOnce(true);
        startCooldown();

        trackResend(isResend ? "otp_resent" : "otp_sent", {
          email: normalizedEmail,
        });

        posthog.capture("otp_sent", {
          email: normalizedEmail,
          is_resend: isResend,
        });

        toast.success(
          isResend
            ? "A new code is on its way"
            : "Check your inbox for your sign-in code",
        );
      } catch (error) {
        onCaptchaReset?.();
        trackResend("otp_send_failed", { email: normalizedEmail });

        posthog.capture("otp_send_failed", {
          email: normalizedEmail,
          is_resend: isResend,
        });

        const authError = parseAuthError(error);
        toast.error(authError.message);

        if (authError.code === "RATE_LIMITED") {
          startCooldown();
        }
      }
    },
    [
      captchaToken,
      email,
      isCoolingDown,
      isSending,
      onCaptchaReset,
      rememberDevice,
      sendOtpMutation,
      startCooldown,
      trackResend,
    ],
  );

  const handleSendCode = useCallback(async () => {
    await runSendOtp(false);
  }, [runSendOtp]);

  const handleResend = useCallback(async () => {
    await runSendOtp(true);
  }, [runSendOtp]);

  const handleVerifyCode = useCallback(async () => {
    if (isVerifying || code.length !== OTP_LENGTH) {
      return;
    }

    setOtpInvalid(false);

    try {
      const result = await verifyOtpMutation.mutateAsync({
        email,
        token: code,
        next,
        rememberDevice,
      });

      posthog.identify(email, { email });
      posthog.capture("otp_verified", { email });
      toast.success("You're signed in");
      router.push(result.next);
      router.refresh();
    } catch (error) {
      const authError = parseAuthError(error);

      setOtpInvalid(
        authError.code === "INVALID_OTP" || authError.code === "EXPIRED_OTP",
      );
      posthog.capture("otp_verification_failed", {
        email,
        error_code: authError.code,
      });
      toast.error(authError.message);
    }
  }, [code, email, isVerifying, next, rememberDevice, router, verifyOtpMutation]);

  const resetToEmailStep = useCallback(() => {
    setStep("email");
    setCode("");
    setOtpInvalid(false);
    onCaptchaReset?.();
  }, [onCaptchaReset]);

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    isSending,
    isVerifying,
    isSubmitting,
    hasSentOnce,
    cooldownLabel,
    isResendDisabled,
    otpInvalid,
    handleSendCode,
    handleVerifyCode,
    handleResend,
    resetToEmailStep,
  };
}
