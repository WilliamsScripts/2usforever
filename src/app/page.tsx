import HomePage from "@/components/landing/HomePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomeJsonLd, homeMetadata } from "@/lib/seo";

export const metadata = homeMetadata;

export default function Home() {
  return (
    <>
      <JsonLd data={getHomeJsonLd()} />
      <HomePage />
    </>
  );
}
