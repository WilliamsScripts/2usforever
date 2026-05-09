"use client";
import React, { useEffect } from "react";
import LandingFrame from "@/components/landing/LandingFrame";

// ---- UI Animation Hooks & Utilities ----

// Intersection observer effect for step elements
function useStepReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 },
    );
    const steps = document.querySelectorAll<HTMLElement>(".step");
    steps.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
}

// ---- Main Home Page ----

export default function Home() {
  // Ensure step reveal and side effect hooks run
  useStepReveal();

  return (
    <LandingFrame ctaHref="/create-moment">
      <section className="hero">
        <div className="hero-badge">
          <span className="dot"></span>
          Making love unforgettable, one page at a time
        </div>

        <h1>
          Turn your feelings
          <br />
          into <em>a moment</em>
          <br />
          they&apos;ll never forget
        </h1>

        <p>
          Beautiful, personalised surprise pages for love notes, anniversaries,
          proposals, birthdays — created in minutes, remembered forever.
        </p>

        <div className="hero-actions">
          <a href="/create-moment" className="btn-primary">
            Create a moment →
          </a>
          <a href="#occasions" className="btn-ghost">
            See occasions
          </a>
        </div>

        <div className="hero-preview">
          <div className="preview-card">
            <span className="icon">💍</span>
            <h4>Proposals</h4>
            <p>Say &quot;will you marry me?&quot; beautifully</p>
          </div>
          <div className="preview-card">
            <span className="icon">💌</span>
            <h4>Love Notes</h4>
            <p>Words that land straight in the heart</p>
          </div>
          <div className="preview-card">
            <span className="icon">🎂</span>
            <h4>Birthdays</h4>
            <p>More than a text — a whole moment</p>
          </div>
        </div>
      </section>

      <section className="occasions" id="occasions">
        <div className="occasions-header">
          <p className="section-label">Occasions</p>
          <h2 className="section-title">
            Every love deserves a <em>beautiful moment</em>
          </h2>
          <p className="section-sub">
            Choose your occasion. We handle the beauty, the emotion, and the
            magic.
          </p>
        </div>

        <div className="occasions-grid">
          {/* ... Occasion cards unchanged ... */}
          <div className="occasion-card">
            <span className="oc-emoji">💍</span>
            <span className="oc-tag">Most Popular</span>
            <h3>Proposal</h3>
            <p>
              The most important question of your life — make it cinematic. A
              full surprise reveal page she&apos;ll screenshot and keep forever.
            </p>
            <div className="oc-price">
              From ₦20,000 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>Elegant reveal animation</li>
              <li>Ring emoji countdown</li>
              <li>Custom love story timeline</li>
              <li>Photo gallery</li>
              <li>QR code for sharing</li>
            </ul>
          </div>
          <div className="occasion-card">
            <span className="oc-emoji">🎂</span>
            <span className="oc-tag">Fan Favourite</span>
            <h3>Birthday Romance</h3>
            <p>
              Skip the basic birthday text. Send a full microsite — photos,
              confetti, a love letter and a message they&apos;ll read twice.
            </p>
            <div className="oc-price">
              From ₦5,000 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>Animated confetti on open</li>
              <li>AI-assisted birthday message</li>
              <li>Photo gallery upload</li>
              <li>Private shareable link</li>
            </ul>
          </div>
          <div className="occasion-card">
            <span className="oc-emoji">💑</span>
            <span className="oc-tag">Emotional</span>
            <h3>Anniversary</h3>
            <p>
              &quot;Happy 2 years&quot; hits different when it comes with a
              timeline of your memories, your favourite photos, and words from
              the heart.
            </p>
            <div className="oc-price">
              From ₦8,000 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>Couple timeline builder</li>
              <li>Memory gallery</li>
              <li>AI love letter generator</li>
              <li>Music embed support</li>
            </ul>
          </div>
          <div className="occasion-card">
            <span className="oc-emoji">✈️</span>
            <span className="oc-tag">Long Distance</span>
            <h3>Surprise Drop</h3>
            <p>
              Schedule love notes to arrive at exactly the right moment — while
              they&apos;re at work, missing you, or just needing a smile.
            </p>
            <div className="oc-price">
              From ₦3,500 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>&quot;Open when you miss me&quot; notes</li>
              <li>Time-until-we-meet countdown</li>
              <li>Scheduled delivery</li>
              <li>Voice note attachment</li>
            </ul>
          </div>
          <div className="occasion-card">
            <span className="oc-emoji">💌</span>
            <span className="oc-tag">Classic</span>
            <h3>Love Note</h3>
            <p>
              Just because. No occasion needed. A beautiful page that says
              exactly what you feel, exactly when they need to hear it.
            </p>
            <div className="oc-price">
              From ₦3,000 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>Gorgeous letter templates</li>
              <li>Petal animation on open</li>
              <li>AI poem generation (add-on)</li>
              <li>Shareable private link</li>
            </ul>
          </div>
          <div className="occasion-card">
            <span className="oc-emoji">🎊</span>
            <span className="oc-tag">Special</span>
            <h3>Apology & Healing</h3>
            <p>
              Sometimes sorry isn&apos;t enough. A heartfelt, beautifully
              designed page goes further than words — it shows you truly care.
            </p>
            <div className="oc-price">
              From ₦4,000 <span>/ page</span>
            </div>
            <ul className="oc-features">
              <li>Sincere letter templates</li>
              <li>Warm, healing design</li>
              <li>Memory of good times gallery</li>
              <li>Thoughtful closing message</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="how-inner">
          <div>
            <p className="section-label">How it works</p>
            <h2 className="section-title">
              Beautiful in
              <br />
              <em>under 5 minutes</em>
            </h2>
            <p className="section-sub">
              No design skills. No tech headaches. Just your love story —
              elegantly presented.
            </p>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-body">
                  <h4>Pick your occasion</h4>
                  <p>
                    Choose from proposals, love notes, anniversaries, birthdays,
                    and more. Each comes with a tailored design.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-body">
                  <h4>Add your story</h4>
                  <p>
                    Upload photos, write your message (or let our AI help), add
                    music, and choose your template.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-body">
                  <h4>Pay & generate</h4>
                  <p>
                    A private, beautiful page is created — yours to share
                    instantly or schedule for the perfect moment.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">4</div>
                <div className="step-body">
                  <h4>They open it & feel everything</h4>
                  <p>
                    Send the link. Watch them react. Your page stays live so
                    they can return to it whenever they want.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mockup-phone">
            <span className="mockup-rose">🌹</span>
            <p className="mockup-from">A message for</p>
            <h3 className="mockup-name">Jessica ♡</h3>
            <p className="mockup-msg">
              &quot;Every morning I wake up grateful that somehow, out of
              everyone in this world, I found you. Happy 2 years, my love.&quot;
            </p>
            <button className="mockup-btn">Open your moment ✨</button>
            <div className="mockup-url">2usforever.com/for/jessica</div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="pricing-header">
          <p className="section-label">Pricing</p>
          <h2 className="section-title">
            Pay once.
            <br />
            Remember <em>forever.</em>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            No subscriptions. No tricks. Just one beautiful page for one special
            moment.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-tier">Starter</div>
            <div className="price-amount">₦3,000</div>
            <div className="price-occasion">Love note · Birthday text</div>
            <ul className="price-list">
              <li>
                <span className="check">✦</span> Beautiful letter page
              </li>
              <li>
                <span className="check">✦</span> Petal animation
              </li>
              <li>
                <span className="check">✦</span> 1 photo upload
              </li>
              <li>
                <span className="check">✦</span> Private shareable link
              </li>
              <li>
                <span className="check">✦</span> Active for 30 days
              </li>
            </ul>
            <a href="/create-moment" className="btn-card">
              Get started →
            </a>
          </div>

          <div className="price-card featured">
            <div className="price-best">Most popular</div>
            <div className="price-tier">Premium</div>
            <div className="price-amount">₦10,000</div>
            <div className="price-occasion">Anniversary · Surprise drop</div>
            <ul className="price-list">
              <li>
                <span className="check">✦</span> Animated premium page
              </li>
              <li>
                <span className="check">✦</span> AI love letter assist
              </li>
              <li>
                <span className="check">✦</span> Up to 10 photos
              </li>
              <li>
                <span className="check">✦</span> Memory timeline
              </li>
              <li>
                <span className="check">✦</span> Music embed
              </li>
              <li>
                <span className="check">✦</span> Active for 1 year
              </li>
            </ul>
            <a href="/create-moment" className="btn-card-white">
              Get started →
            </a>
          </div>

          <div className="price-card">
            <div className="price-tier">Proposal</div>
            <div className="price-amount">₦25,000</div>
            <div className="price-occasion">The big question</div>
            <ul className="price-list">
              <li>
                <span className="check">✦</span> Full cinematic reveal
              </li>
              <li>
                <span className="check">✦</span> Ring animation
              </li>
              <li>
                <span className="check">✦</span> Unlimited photos
              </li>
              <li>
                <span className="check">✦</span> Custom domain add-on
              </li>
              <li>
                <span className="check">✦</span> Video upload support
              </li>
              <li>
                <span className="check">✦</span> Lifetime page hosting
              </li>
            </ul>
            <a href="/create-moment" className="btn-card">
              Get started →
            </a>
          </div>
        </div>
      </section>

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
              &quot;She thought it was just a link. When she opened it and saw
              our photos, her name, and my letter — she called me crying.
              I&apos;ve never felt more in love.&quot;
            </p>
            <div className="testi-author">
              <div className="testi-avatar">KC</div>
              <div>
                <div className="testi-name">Kingsley C.</div>
                <div className="testi-info">Lagos · Anniversary package</div>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">
              &quot;I used the proposal package and she literally screamed. I
              had the ring ready and the whole family was watching. Best moment
              of my life — 2UsForever made it perfect.&quot;
            </p>
            <div className="testi-author">
              <div className="testi-avatar">EO</div>
              <div>
                <div className="testi-name">Emmanuel O.</div>
                <div className="testi-info">Abuja · Proposal package</div>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">
              &quot;My boyfriend is in Canada and I sent him a surprise drop for
              his birthday. He said it was the most thoughtful thing anyone had
              ever done for him. Worth every naira.&quot;
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

      <section className="create-section">
        <h2>
          Someone is waiting to feel <em>completely loved</em>
        </h2>
        <p>
          Create their moment today. It takes 5 minutes. They&apos;ll remember
          it forever.
        </p>
        <a
          href="/create-moment"
          className="btn-primary"
          style={{ fontSize: "16px", padding: "18px 44px" }}
        >
          Create a moment for free →
        </a>
      </section>
    </LandingFrame>
  );
}
