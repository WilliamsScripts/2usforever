"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isCaptchaEnabled } from "@/components/auth/Captcha";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { useAuthResendAnalytics } from "@/hooks/useAuthResendAnalytics";
import { useCooldown } from "@/hooks/useCooldown";
import { parseAuthError } from "@/lib/auth/errors";
import { isDeviceRemembered } from "@/lib/auth/remember-device";

type LoginStep = "email" | "code";

type UseOtpLoginOptions = {
  next: string;
  captchaToken?: string | null;
  rememberDevice?: boolean;
  onCaptchaReset?: () => void;
};

const SEND_DEBOUNCE_MS = 500;

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
  const lastSendAtRef = useRef(0);

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpInvalid, setOtpInvalid] = useState(false);
  const [hasSentOnce, setHasSentOnce] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const cooldownScope = email.trim().toLowerCase() || "anonymous";

  const { startCooldown, label: cooldownLabel, isCoolingDown } = useCooldown({
    scope: cooldownScope,
  });

  const isSending = sendOtpMutation.isPending;
  const isVerifying = verifyOtpMutation.isPending;
  const isSubmitting = isLocked || isSending || isVerifying;
  const isResendDisabled = isSending || isCoolingDown || isLocked;

  const runSendOtp = useCallback(
    async (isResend: boolean) => {
      if (isLocked || isCoolingDown) {
        return;
      }

      const now = Date.now();
      if (now - lastSendAtRef.current < SEND_DEBOUNCE_MS) {
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

      lastSendAtRef.current = now;
      setIsLocked(true);

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

        toast.success(
          isResend
            ? "A new code is on its way"
            : "Check your inbox for your sign-in code",
        );
      } catch (error) {
        onCaptchaReset?.();
        trackResend("otp_send_failed", { email: normalizedEmail });

        const authError = parseAuthError(error);
        toast.error(authError.message);

        if (authError.code === "RATE_LIMITED") {
          startCooldown();
        }
      } finally {
        setIsLocked(false);
      }
    },
    [
      captchaToken,
      email,
      isCoolingDown,
      isLocked,
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
    if (isLocked || code.length !== 6) {
      return;
    }

    setIsLocked(true);
    setOtpInvalid(false);

    try {
      const result = await verifyOtpMutation.mutateAsync({
        email,
        token: code,
        next,
        rememberDevice,
      });

      toast.success("You're signed in");
      router.push(result.next);
      router.refresh();
    } catch (error) {
      const authError = parseAuthError(error);

      setOtpInvalid(
        authError.code === "INVALID_OTP" || authError.code === "EXPIRED_OTP",
      );
      toast.error(authError.message);
    } finally {
      setIsLocked(false);
    }
  }, [code, email, isLocked, next, rememberDevice, router, verifyOtpMutation]);

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
