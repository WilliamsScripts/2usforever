import { MomentData } from "./types";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import FloralTemplate from "./templates/FloralTemplate";
import StarryTemplate from "./templates/StarryTemplate";

export default function MomentDisplay({ data }: { data: MomentData }) {
  switch (data.template) {
    case "modern":
      return <ModernTemplate data={data} />;
    case "floral":
      return <FloralTemplate data={data} />;
    case "starry":
      return <StarryTemplate data={data} />;
    default:
      return <ClassicTemplate data={data} />;
  }
}
