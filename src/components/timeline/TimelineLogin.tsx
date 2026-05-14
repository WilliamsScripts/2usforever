"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TimelineFrame } from "@/components/timeline/TimelineFrame";
import { sendMagicLink } from "@/services/timeline.service";

export function TimelineLogin() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") ?? "/timeline";
  const authError = searchParams.get("error") === "auth";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await sendMagicLink(email, next);
      setSent(true);
      toast.success("Check your inbox for the magic link");
    } catch {
      toast.error("Could not send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimelineFrame>
      <section className="timeline-login">
        <p className="timeline-eyebrow">Private & secure</p>
        <h1 className="timeline-title">Your timeline awaits</h1>
        <p className="timeline-subtitle">
          Sign in with the same email you used when creating or receiving a
          moment. We&apos;ll send you a magic link — no password needed.
        </p>

        {authError ? (
          <p className="timeline-login-error" role="alert">
            That sign-in link expired or was invalid. Request a new one below.
          </p>
        ) : null}

        {sent ? (
          <div className="timeline-login-sent">
            <p className="timeline-login-sent-title">Magic link sent</p>
            <p>
              We emailed <strong>{email}</strong>. Open the link on this device
              to view your timeline.
            </p>
            <button
              type="button"
              className="timeline-retry"
              onClick={() => setSent(false)}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="timeline-login-form">
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
            <button type="submit" className="timeline-login-submit" disabled={loading}>
              {loading ? "Sending…" : "Send magic link"}
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
