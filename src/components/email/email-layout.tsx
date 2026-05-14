import type { ReactNode } from "react";
import { WHATSAPP_LOGO_SRC } from "@/lib/email-assets";
import { Img } from "react-email";

export const emailColors = {
  rose: "#C8516A",
  roseDeep: "#7A1A2A",
  roseLight: "#F5D6DC",
  blush: "#FAF0F2",
  ivory: "#FAF6F0",
  gold: "#C4953A",
  textDark: "#1A0810",
  textMid: "#6B4050",
  textSoft: "#A88090",
  white: "#FFFFFF",
  border: "rgba(184, 67, 90, 0.18)",
} as const;

type EmailLayoutProps = {
  preview: string;
  eyebrow: string;
  title?: string | null;
  children: ReactNode;
};

export function EmailLayout({
  preview,
  eyebrow,
  title,
  children,
}: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title style={{ textAlign: "center" }}>{preview}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: emailColors.ivory,
          fontFamily: "'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          {preview}
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: emailColors.ivory, padding: "40px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 560,
                    backgroundColor: emailColors.white,
                    borderRadius: 20,
                    overflow: "hidden",
                    border: `1px solid ${emailColors.border}`,
                    boxShadow: "0 16px 48px rgba(122, 26, 42, 0.08)",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          background: `linear-gradient(135deg, ${emailColors.roseDeep} 0%, #3d0a1e 100%)`,
                          padding: "28px 32px 24px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 11,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.55)",
                          }}
                        >
                          2UsForever
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: emailColors.gold,
                          }}
                        >
                          {eyebrow}
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "32px 32px 8px" }}>
                        {title ? (
                          <h1
                            style={{
                              margin: "0 0 20px",
                              fontFamily:
                                "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
                              fontSize: 34,
                              lineHeight: 1.15,
                              fontWeight: 400,
                              color: emailColors.textDark,
                            }}
                          >
                            {title}
                          </h1>
                        ) : null}
                        {children}
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding: "16px 32px 28px",
                          borderTop: `1px solid ${emailColors.border}`,
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            lineHeight: 1.6,
                            color: emailColors.textSoft,
                          }}
                        >
                          Made with love on{" "}
                          <span style={{ color: emailColors.rose }}>
                            2UsForever
                          </span>
                          .
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: "28px auto 8px" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              borderRadius: 999,
              backgroundColor: emailColors.rose,
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 500,
                color: emailColors.white,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailSecondaryButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: "8px auto 0" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              borderRadius: 999,
              backgroundColor: emailColors.blush,
              border: `1px solid ${emailColors.border}`,
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 500,
                color: emailColors.textDark,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailUpsellBox({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div
      style={{
        margin: "28px 0 0",
        padding: "20px 22px",
        borderRadius: 16,
        backgroundColor: emailColors.ivory,
        border: `1px solid ${emailColors.border}`,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontFamily:
            "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
          fontSize: 24,
          lineHeight: 1.2,
          color: emailColors.textDark,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 14,
          lineHeight: 1.7,
          color: emailColors.textMid,
        }}
      >
        {body}
      </p>
      <EmailButton href={ctaHref} label={ctaLabel} />
    </div>
  );
}

export function WhatsAppButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      align="center"
      style={{ margin: "8px auto 0" }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              borderRadius: 999,
              backgroundColor: emailColors.blush,
              border: `1px solid ${emailColors.border}`,
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "0px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: emailColors.textDark,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                align="center"
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingRight: 4,
                        verticalAlign: "middle",
                        lineHeight: 0,
                      }}
                    >
                      <Img
                        src={WHATSAPP_LOGO_SRC}
                        alt=""
                        width={40}
                        height={40}
                        style={{ display: "block", border: 0 }}
                      />
                    </td>
                    <td
                      style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}
                    >
                      {label}
                    </td>
                  </tr>
                </tbody>
              </table>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <tr>
      <td
        style={{
          padding: "10px 0",
          borderBottom: `1px solid ${emailColors.border}`,
        }}
      >
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: emailColors.textSoft,
                  width: "38%",
                }}
              >
                {label}
              </td>
              <td
                style={{
                  fontSize: 15,
                  color: emailColors.textDark,
                  fontWeight: 500,
                }}
              >
                {value}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  );
}

function formatScheduledDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatScheduledLabel(
  scheduledDate?: string | null,
): string | null {
  if (!scheduledDate) return null;
  return formatScheduledDate(scheduledDate);
}
