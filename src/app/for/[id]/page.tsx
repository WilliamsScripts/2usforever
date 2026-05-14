import { headers } from "next/headers";
import MomentDisplay from "./MomentDisplay";
import { getMoment } from "@/services/moments.service";

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

  return <MomentDisplay data={data} />;
}
