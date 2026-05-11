import { createContext, useContext } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic Love Letter",
    description: "Timeless elegance with serif typography",
    emoji: "📜",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean lines, bold typography",
    emoji: "✨",
  },
  {
    id: "floral",
    name: "Floral Romance",
    description: "Soft petals and warm tones",
    emoji: "🌹",
  },
  {
    id: "starry",
    name: "Starry Night",
    description: "Deep blues and golden stars",
    emoji: "🌙",
  },
];

const TemplateContext = createContext<Template[]>(TEMPLATES);

export const useTemplates = () => useContext(TemplateContext);

export const TemplateProvider = TemplateContext.Provider;
