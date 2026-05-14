"use client";
import React from "react";
import LandingFrame from "@/components/landing/LandingFrame";
import { useIsNigeria, useStepReveal } from "@/hooks/useLanding";

const FLOATING_HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: `${3 + i * 6}%`,
  delay: `${(i * 0.7) % 9}s`,
  duration: `${7 + (i % 5) * 1.5}s`,
  size: `${10 + (i % 4) * 5}px`,
  opacity: 0.1 + (i % 4) * 0.05,
}));

const OCCASIONS = [
  "💍 Proposal",
  "💑 Anniversary",
  "🎂 Birthday",
  "💌 Love Note",
  "✈️ Long Distance",
  "🎊 Apology",
  "💝 Valentine's Day",
  "🕌 Eid",
  "🎄 Christmas",
  "🌹 Mother's Day",
  "🦸 Father's Day",
  "🎓 Graduation",
];

export default function Home() {
  useStepReveal();
  const isNigeria = useIsNigeria();
  const price = isNigeria ? "₦5,000" : "$5";

  return (
    <LandingFrame ctaHref="/create-moment">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-hearts" aria-hidden="true">
          {FLOATING_HEARTS.map((h, i) => (
            <span
              key={i}
              className="floating-heart"
              style={{
                left: h.left,
                animationDelay: h.delay,
                animationDuration: h.duration,
                fontSize: h.size,
                opacity: h.opacity,
              }}
            >
              ♡
            </span>
          ))}
        </div>

        <h1>
          They&apos;ll open a link.
          <br />
          They&apos;ll feel <em>everything.</em>
        </h1>

        <p>
          A personalised page with your words, your photos, and your song. Built
          in in minutes. Remembered forever.
        </p>

        <div className="hero-actions">
          <a href="/create-moment" className="btn-primary">
            Create a moment
          </a>
          <a href="#how" className="btn-ghost">
            See how it works
          </a>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <div className="how-inner">
          <div>
            <p className="section-label">How it works</p>
            <h2 className="section-title">
              Done in <em>5 minutes.</em>
              <br />
              Remembered forever.
            </h2>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-body">
                  <h4>Pick your occasion &amp; write your message</h4>
                  <p>
                    Choose from 19 occasions. Write from scratch or let AI craft
                    the perfect love letter for you in seconds.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-body">
                  <h4>Add photos &amp; your song</h4>
                  <p>
                    Upload up to 5 photos as polaroid frames. Search any Spotify
                    track and it plays the moment they open the page.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-body">
                  <h4>Share &amp; watch them react</h4>
                  <p>
                    Send the private link via WhatsApp or copy it anywhere. The
                    page lives forever.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mockup-phone">
            <div className="mockup-polaroids">
              <div
                className="mockup-polaroid"
                style={{
                  transform: "rotate(-4deg)",
                  background: "linear-gradient(135deg,#FFC5D3,#FFB0C8)",
                }}
              />
              <div
                className="mockup-polaroid"
                style={{
                  transform: "rotate(2.5deg)",
                  background: "linear-gradient(135deg,#C8516A,#8B3A62)",
                }}
              />
              <div
                className="mockup-polaroid"
                style={{
                  transform: "rotate(-1.5deg)",
                  background: "linear-gradient(135deg,#FFD0DD,#FFC0CF)",
                }}
              />
            </div>
            <p className="mockup-from">A moment for</p>
            <h3 className="mockup-name">Jessica ♡</h3>
            <p className="mockup-msg">
              &ldquo;Every morning I wake up grateful that out of everyone in
              this world, I found you.&rdquo;
            </p>
            <div className="mockup-music-pill">
              🎵 &nbsp;Perfect — Ed Sheeran
            </div>
            <button className="mockup-btn">Open your moment ✨</button>
            <div className="mockup-url">2usforever.com/for/jessica</div>
          </div>
        </div>
      </section>

      {/* ── OCCASIONS ── */}
      <section className="occasions" id="occasions">
        <div className="occasions-header">
          <p className="section-label">Occasions</p>
          <h2 className="section-title">
            Every love deserves <em>a beautiful moment</em>
          </h2>
        </div>
        <div className="occasion-pills-grid">
          {OCCASIONS.map((o) => (
            <a key={o} href="/create-moment" className="occasion-pill">
              {o}
            </a>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="pricing-header">
          <p className="section-label">Pricing</p>
          <h2 className="section-title">
            One price. <em>One perfect moment.</em>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            No subscriptions. No tricks. Pay once, give someone a page
            they&apos;ll never forget.
          </p>
        </div>

        <div className="pricing-single">
          <div className="price-card-single">
            <div className="price-best">Everything included</div>
            <div className="price-amount-large">{price}</div>
            <div className="price-note">per moment</div>
            <div className="price-divider" />
            <ul className="price-list-two-col">
              <li>
                <span className="check">✦</span> Beautiful animated page
              </li>
              <li>
                <span className="check">✦</span> AI love letter
              </li>
              <li>
                <span className="check">✦</span> Spotify music embed
              </li>
              <li>
                <span className="check">✦</span> Polaroid photo gallery
              </li>
              <li>
                <span className="check">✦</span> Private link forever
              </li>
              <li>
                <span className="check">✦</span> WhatsApp delivery
              </li>
            </ul>
            <a href="/create-moment" className="btn-primary btn-price-cta">
              Create your moment
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials">
        <div className="testimonials-header">
          <p className="section-label">Love stories</p>
          <h2 className="section-title">
            They said yes.
            <br />
            They <em>cried happy tears.</em>
          </h2>
        </div>

        <div className="testi-grid">
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">
              &ldquo;She thought it was just a link. When our song started
              playing and she saw the photos and my letter, she called me
              crying.&rdquo;
            </p>
            <div className="testi-author">
              <div className="testi-avatar">KC</div>
              <div>
                <div className="testi-name">Kingsley C.</div>
                <div className="testi-info">Lagos · Anniversary</div>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">
              &ldquo;She literally screamed. I had the ring ready, the whole
              family was watching. The AI helped me write the message and it was
              perfect.&rdquo;
            </p>
            <div className="testi-author">
              <div className="testi-avatar">EO</div>
              <div>
                <div className="testi-name">Emmanuel O.</div>
                <div className="testi-info">Abuja · Proposal</div>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">
              &ldquo;He said it was the most thoughtful thing anyone had ever
              done for him. And I built it in 5 minutes.&rdquo;
            </p>
            <div className="testi-author">
              <div className="testi-avatar">TI</div>
              <div>
                <div className="testi-name">Temi I.</div>
                <div className="testi-info">Port Harcourt · Long distance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="create-section">
        <div className="create-hearts" aria-hidden="true">
          {["♡", "♡", "♡", "♡", "♡"].map((h, i) => (
            <span
              key={i}
              className="create-heart"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              {h}
            </span>
          ))}
        </div>
        <h2>
          Someone is waiting to feel <em>completely loved</em>
        </h2>
        <p>Five minutes to build. A lifetime to remember.</p>
        <a
          href="/create-moment"
          className="btn-primary"
          style={{ fontSize: "16px", padding: "18px 48px" }}
        >
          Create a moment
        </a>
      </section>
    </LandingFrame>
  );
}
