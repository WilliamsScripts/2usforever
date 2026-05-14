export type ScheduledCountdownTheme = {
  background: string;
  fontFamily: string;
  labelColor: string;
  labelLetterSpacing: string;
  titleColor: string;
  titleTextShadow?: string;
  titleFontStyle?: "normal" | "italic";
  titleFontWeight?: number;
  dateColor: string;
  footnoteColor: string;
  unitBackground: string;
  unitBorder: string;
  unitBoxShadow: string;
  unitValueColor: string;
  unitLabelColor: string;
  dividerGradient: string;
  accentColor: string;
};

const CLASSIC_THEME: ScheduledCountdownTheme = {
  background:
    "radial-gradient(ellipse at 50% 0%, #3d0a1e 0%, #1c0510 35%, #0e0412 65%, #060108 100%)",
  fontFamily: "var(--font-cormorant)",
  labelColor: "rgba(253, 164, 175, 0.5)",
  labelLetterSpacing: "0.35em",
  titleColor: "#FFF1F2",
  titleTextShadow: "0 0 50px rgba(200, 81, 106, 0.45)",
  titleFontWeight: 300,
  dateColor: "rgba(254, 205, 211, 0.65)",
  footnoteColor: "rgba(253, 164, 175, 0.55)",
  unitBackground:
    "linear-gradient(160deg, rgba(255,240,245,0.10) 0%, rgba(180,60,90,0.08) 100%)",
  unitBorder: "1px solid rgba(200, 81, 106, 0.28)",
  unitBoxShadow: "0 0 40px rgba(200,81,106,0.12)",
  unitValueColor: "#FFF1F2",
  unitLabelColor: "rgba(253, 164, 175, 0.55)",
  dividerGradient:
    "linear-gradient(to right, transparent, rgba(200, 81, 106, 0.65))",
  accentColor: "rgba(244, 114, 182, 0.7)",
};

const MODERN_THEME: ScheduledCountdownTheme = {
  background: "#030812",
  fontFamily: "var(--font-cormorant)",
  labelColor: "#FFD580",
  labelLetterSpacing: "0.55em",
  titleColor: "#EEF2FF",
  titleTextShadow:
    "0 2px 40px rgba(100,130,255,0.25), 0 0 80px rgba(80,100,200,0.12)",
  titleFontStyle: "italic",
  titleFontWeight: 300,
  dateColor: "rgba(200, 212, 248, 0.7)",
  footnoteColor: "rgba(148, 163, 184, 0.65)",
  unitBackground: "rgba(255,255,255,0.038)",
  unitBorder: "1px solid rgba(100,130,255,0.22)",
  unitBoxShadow:
    "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  unitValueColor: "#EEF2FF",
  unitLabelColor: "rgba(255, 213, 128, 0.65)",
  dividerGradient:
    "linear-gradient(to right, transparent, rgba(255,213,128,0.45))",
  accentColor: "#FFD580",
};

const FLORAL_THEME: ScheduledCountdownTheme = {
  background: "#060110",
  fontFamily: "var(--font-cormorant)",
  labelColor: "#D4899F",
  labelLetterSpacing: "0.45em",
  titleColor: "#FFF5EC",
  titleTextShadow:
    "0 0 40px rgba(255,150,170,0.4), 0 2px 24px rgba(0,0,0,0.6)",
  titleFontStyle: "italic",
  titleFontWeight: 300,
  dateColor: "rgba(240, 176, 160, 0.75)",
  footnoteColor: "rgba(200, 112, 144, 0.65)",
  unitBackground:
    "linear-gradient(145deg, rgba(255,245,236,0.08) 0%, rgba(200,112,144,0.06) 100%)",
  unitBorder: "1px solid rgba(212, 137, 159, 0.28)",
  unitBoxShadow: "0 0 36px rgba(212,137,159,0.14)",
  unitValueColor: "#FFF5EC",
  unitLabelColor: "rgba(212, 137, 159, 0.7)",
  dividerGradient:
    "linear-gradient(to right, transparent, rgba(212,137,159,0.55))",
  accentColor: "#C87090",
};

const STARRY_THEME: ScheduledCountdownTheme = {
  background: "#070012",
  fontFamily: "var(--font-playfair)",
  labelColor: "rgba(201,168,76,0.55)",
  labelLetterSpacing: "0.6em",
  titleColor: "#EAD8A4",
  titleTextShadow:
    "0 0 60px rgba(201,168,76,0.5), 0 0 120px rgba(110,35,160,0.3)",
  titleFontWeight: 500,
  dateColor: "rgba(201,168,76,0.72)",
  footnoteColor: "rgba(201,168,76,0.45)",
  unitBackground:
    "linear-gradient(145deg, rgba(22,8,50,0.72) 0%, rgba(12,4,32,0.82) 100%)",
  unitBorder: "1px solid rgba(201,168,76,0.28)",
  unitBoxShadow:
    "0 0 0 1px rgba(255,255,255,0.03), inset 0 0 40px rgba(110,35,160,0.08)",
  unitValueColor: "#EAD8A4",
  unitLabelColor: "rgba(201,168,76,0.55)",
  dividerGradient:
    "linear-gradient(to right, transparent, rgba(201,168,76,0.55))",
  accentColor: "rgba(201,168,76,0.7)",
};

const THEMES: Record<string, ScheduledCountdownTheme> = {
  classic: CLASSIC_THEME,
  modern: MODERN_THEME,
  floral: FLORAL_THEME,
  starry: STARRY_THEME,
};

export function getScheduledCountdownTheme(
  template?: string | null,
): ScheduledCountdownTheme {
  if (!template) return CLASSIC_THEME;
  return THEMES[template] ?? CLASSIC_THEME;
}
