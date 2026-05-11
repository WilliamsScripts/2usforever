import { headers } from "next/headers";
import MomentDisplay from "./MomentDisplay";

async function getMoment(id: string) {
  const headersList = await headers();

  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/moments?id=${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const { data } = await res.json();
  return data;
}

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getMoment(id);

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
