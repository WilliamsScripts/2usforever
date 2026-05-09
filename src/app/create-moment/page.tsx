"use client";

import React from "react";
import Link from "next/link";
import LandingFrame from "@/components/landing/LandingFrame";
import CreateMomentBuilder from "@/components/landing/CreateMomentBuilder";

export default function CreateMomentPage() {
  return (
    <LandingFrame ctaHref="/create-moment">
      <section className="hero">
        <div className="hero-badge">
          <span className="dot"></span>
          Build a beautiful moment in minutes
        </div>

        <h1>
          Create <em>their page</em>
          <br />
          with the same magic
          <br />
          and emotion
        </h1>

        <p>
          Fill in your details below and instantly preview a personalised page
          they&apos;ll cherish forever.
        </p>

        <div className="hero-actions">
          <a href="#create" className="btn-primary">
            Start creating →
          </a>
          <Link href="/" className="btn-ghost">
            Back to landing
          </Link>
        </div>
      </section>

      <CreateMomentBuilder />
    </LandingFrame>
  );
}
