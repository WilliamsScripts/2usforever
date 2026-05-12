import LandingFrame from "@/components/landing/LandingFrame";
import CreateMomentBuilder from "@/components/landing/CreateMomentBuilder";

export default function CreateMomentPage() {
  return (
    <LandingFrame ctaHref="/create-moment">
      <CreateMomentBuilder />
    </LandingFrame>
  );
}
