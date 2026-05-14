"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";

type LoginStep = "email" | "code";

export function useTimelineLogin(next: string) {
  const router = useRouter();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const isSending = sendOtpMutation.isPending;
  const isVerifying = verifyOtpMutation.isPending;
  const isLoading = isSending || isVerifying;

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await sendOtpMutation.mutateAsync(email);
      setStep("code");
      setCode("");
      toast.success("Check your inbox for your sign-in code");
    } catch {
      toast.error("Could not send sign-in code. Please try again.");
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await verifyOtpMutation.mutateAsync({ email, token: code, next });
      router.push(result.next);
      router.refresh();
    } catch {
      toast.error("That code is invalid or expired. Try again or request a new one.");
    }
  };

  const handleResend = async () => {
    try {
      await sendOtpMutation.mutateAsync(email);
      setCode("");
      toast.success("A new code is on its way");
    } catch {
      toast.error("Could not resend code. Please try again.");
    }
  };

  const resetToEmailStep = () => {
    setStep("email");
    setCode("");
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    isSending,
    isVerifying,
    isLoading,
    handleSendCode,
    handleVerifyCode,
    handleResend,
    resetToEmailStep,
  };
}
