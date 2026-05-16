import type { Metadata } from "next";
import { headers } from "next/headers";
import MomentDisplay from "./MomentDisplay";
import { getMoment } from "@/services/moments.service";
import { SITE_NAME, createPageMetadata } from "@/lib/seo";
import type { MomentRecord } from "@/types/moment";

function getMomentTitle(moment: MomentRecord) {
  if (moment.headline?.trim()) {
    return moment.headline.trim();
  }

  const recipient = moment.recipient?.trim();
  const occasion = moment.occasion?.trim();

  if (recipient && occasion) {
    return `${occasion} for ${recipient}`;
  }

  if (recipient) {
    return `A moment for ${recipient}`;
  }

  return "A private love moment";
}

function getMomentDescription(moment: MomentRecord) {
  const sender = moment.sender?.trim() || "Someone special";
  const recipient = moment.recipient?.trim() || "someone they love";

  return `A private ${moment.occasion?.toLowerCase() ?? "love"} page from ${sender} to ${recipient} on ${SITE_NAME}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : undefined;

  try {
    const moment = await getMoment(id, baseUrl);

    if (!moment) {
      return createPageMetadata({
        title: "Moment not found",
        description: "This private love moment could not be found.",
        path: `/for/${id}`,
        noIndex: true,
      });
    }

    const title = getMomentTitle(moment);
    const description = getMomentDescription(moment);

    return {
      ...createPageMetadata({
        title,
        description,
        path: `/for/${id}`,
        noIndex: true,
      }),
      openGraph: {
        title: `${title} · ${SITE_NAME}`,
        description,
        type: "website",
      },
    };
  } catch {
    return createPageMetadata({
      title: "Moment not found",
      description: "This private love moment could not be found.",
      path: `/for/${id}`,
      noIndex: true,
    });
  }
}

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : undefined;

  let data = null;
  try {
    data = await getMoment(id, baseUrl);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center min-h-screen text-rose-300/60 text-sm tracking-widest uppercase"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #3d0a1e 0%, #0e0412 60%, #060108 100%)",
        }}
      >
        moment not found
      </div>
    );
  }

  if (data.status !== "active" || data.payment_status !== "paid") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center text-rose-200/70 text-sm tracking-wide"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #3d0a1e 0%, #0e0412 60%, #060108 100%)",
        }}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-rose-300/50">
          Not available yet
        </p>
        <p className="max-w-sm text-base leading-relaxed text-rose-100/80">
          This moment is waiting on payment before it can be opened.
        </p>
      </div>
    );
  }

  return <MomentDisplay data={data} />;
}
