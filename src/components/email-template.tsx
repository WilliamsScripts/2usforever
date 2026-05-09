import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        background: "#fffafc",
        padding: "32px 24px",
        borderRadius: 16,
        boxShadow: "0 6px 36px rgba(188,145,178,0.09)",
        color: "#8E1764",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 16,
          fontWeight: 700,
          color: "#CB368B",
          letterSpacing: "-1px",
        }}
      >
        💌 For {firstName}, With All My Love
      </h1>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.7,
          margin: "0 0 24px 0",
          fontStyle: "italic",
        }}
      >
        Dear {firstName},
        <br />
        <br />
        You are the melody in my every day, the gentle strength that holds me
        steady, and the laughter that lifts me up.
        <br />
        <br />
        Today (and every day), I want to remind you how deeply cherished and
        adored you are. No words could ever describe what you mean to me, but I
        hope this little love note brings a smile to your heart.
        <br />
        <br />
        With all that I am, and all that I’ll ever be,
        <br />
        <br />
        <span
          style={{
            fontWeight: 600,
            color: "#A4267B",
          }}
        >
          Forever yours 💖
        </span>
      </p>
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: "#CB368B",
          }}
        >
          — Your Person
        </span>
      </div>
    </div>
  );
}
