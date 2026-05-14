"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { TimelineFrame } from "@/components/timeline/TimelineFrame";
import { useTimelineLogin } from "@/hooks/useTimelineLogin";

export function TimelineLogin() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/timeline";
  const authError = searchParams.get("error") === "auth";

  useEffect(() => {
    if (!authError) return;
    toast.error("That sign-in session expired. Request a new code below.");
  }, [authError]);

  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    isSending,
    isVerifying,
    handleSendCode,
    handleVerifyCode,
    handleResend,
    resetToEmailStep,
  } = useTimelineLogin(next);

  return (
    <TimelineFrame>
      <section className="timeline-login">
        <p className="timeline-eyebrow">Private & secure</p>
        <h1 className="timeline-title">Your timeline awaits</h1>
        <p className="timeline-subtitle">
          Sign in with the same email you used when creating or receiving a
          moment. We&apos;ll email you a one-time code - no password needed.
        </p>

        {authError ? (
          <p className="timeline-login-error" role="alert">
            That sign-in session expired. Enter your email and request a new
            code below.
          </p>
        ) : null}

        {step === "code" ? (
          <form onSubmit={handleVerifyCode} className="timeline-login-form">
            <div className="timeline-login-sent">
              <p className="timeline-login-sent-title">Enter your code</p>
              <p>
                We sent a 6-digit code to <strong>{email}</strong>.
              </p>
            </div>
            <label className="timeline-field">
              <span>Sign-in code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="timeline-input timeline-otp-input"
                placeholder="000000"
                required
                minLength={6}
                maxLength={6}
                pattern="\d{6}"
              />
            </label>
            <button
              type="submit"
              className="timeline-login-submit"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? "Verifying…" : "Sign in"}
            </button>
            <div className="timeline-login-actions">
              <button
                type="button"
                className="timeline-retry"
                onClick={handleResend}
                disabled={isSending}
              >
                Resend code
              </button>
              <button
                type="button"
                className="timeline-retry timeline-retry--ghost"
                onClick={resetToEmailStep}
              >
                Use a different email
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="timeline-login-form">
            <label className="timeline-field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="timeline-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              className="timeline-login-submit"
              disabled={isSending}
            >
              {isSending ? "Sending…" : "Send sign-in code"}
            </button>
          </form>
        )}

        <p className="timeline-login-footnote">
          New here?{" "}
          <Link href="/create-moment" className="timeline-login-link">
            Create your first moment
          </Link>
        </p>
      </section>
    </TimelineFrame>
  );
}
