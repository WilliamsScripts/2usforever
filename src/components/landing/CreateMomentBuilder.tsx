"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import CustomImagePicker from "../custom-image-picker";
import { UploadResult } from "@/services/cloudinary.service";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useTemplates } from "@/context/TemplateContext";

const OCCASIONS = [
  "💌 Love Note",
  "💍 Proposal",
  "💑 Anniversary",
  "🎂 Birthday",
  "✈️ Surprise Drop",
  "🎊 Apology",
  "🎄 Christmas",
  "💝 Valentine's Day",
  "🕌 Eid",
  "🙏 Thanksgiving",
  "🎓 Graduation",
  "🏠 New Home",
  "🤰 Baby on the Way",
  "🎉 Congratulations",
  "🌹 Mother's Day",
  "🦸 Father's Day",
  "💐 Get Well Soon",
  "🛫 Farewell",
  "👋 Welcome",
];

const STEP_LABELS = [
  "Occasion",
  "Message",
  "Photos",
  "Song",
  "Template",
  "Preview",
];

const TOTAL_STEPS = STEP_LABELS.length;

const musicSchema = z.object({
  track_id: z.string().min(1),
  name: z.string().min(1),
  artist_name: z.string().min(1),
  spotify_url: z.string().url(),
  album_image: z.string().url().nullable(),
});

// ADD template to the form validation schema
const createMomentSchema = z.object({
  occasion: z.string().min(1, "Please select an occasion"),
  headline: z.string().trim().max(120).optional(),
  recipient: z.string().trim().min(1, "Their name is required"),
  message: z.string().trim().max(2000).optional(),
  sender: z.string().trim().max(120).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  music: musicSchema.optional(),
  template: z.string().min(1, "Please select a template"),
  sender_email: z
    .string()
    .trim()
    .min(1, "Your email is required")
    .email("Enter a valid email"),
  recipient_email: z
    .string()
    .email("Enter a valid email")
    .trim()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal(""))
    .or(z.null()),
  recipient_phone: z.string().trim().length(11, "Enter 11 digits for phone"),
});

type CreateMomentFormValues = z.infer<typeof createMomentSchema>;

type SpotifyTrackResult = {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  spotifyUrl: string | null;
  trackId: string;
};

type CreatedMomentRecord = {
  id: string;
  occasion: string | null;
  headline: string | null;
  recipient: string | null;
  sender: string | null;
  message: string | null;
  photos: string[] | null;
  music: {
    track_id: string;
    name: string;
    artist_name: string;
    spotify_url: string;
    album_image: string | null;
  } | null;
  created_at: string;
  template: string; // comment out here if not needed in server data
};

export default function CreateMomentBuilder() {
  const TEMPLATES = useTemplates();

  const form = useForm<CreateMomentFormValues>({
    resolver: zodResolver(createMomentSchema),
    defaultValues: {
      occasion: OCCASIONS[0],
      headline: "",
      recipient: "",
      message: "",
      sender: "",
      photos: [],
      music: undefined,
      template: TEMPLATES[0]?.id || "classic",
      sender_email: "",
      recipient_email: "",
      recipient_phone: "",
    },
  });

  // Control state now comes from form (single source of truth)
  const occasion = useWatch({ control: form.control, name: "occasion" });
  const headline = useWatch({ control: form.control, name: "headline" }) ?? "";
  const recipient = useWatch({ control: form.control, name: "recipient" });
  const message = useWatch({ control: form.control, name: "message" });
  const sender = useWatch({ control: form.control, name: "sender" });
  const selectedMusic = useWatch({ control: form.control, name: "music" });
  const photos = useWatch({ control: form.control, name: "photos" }) ?? [];
  const recipient_phone = useWatch({
    control: form.control,
    name: "recipient_phone",
  });
  // Template comes from form, not local state anymore:
  const selectedTemplate = useWatch({
    control: form.control,
    name: "template",
  });

  const [step, setStep] = useState(1);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<SpotifyTrackResult[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [isSavingMoment, setIsSavingMoment] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMoment, setSavedMoment] = useState<CreatedMomentRecord | null>(
    null,
  );
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isImprovingMessage, setIsImprovingMessage] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateFades = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const nudge = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const preview = useMemo(() => {
    const safeRecipient = recipient?.trim() || "";
    const safeSender = sender?.trim() || "";
    const safeMessage = message?.trim() || "";

    const slug = safeRecipient.toLowerCase().replace(/[^a-z0-9]/g, "");
    const title =
      headline.trim() || `${occasion} for ${safeRecipient || "My Love"} ♡`;
    const url = `2usforever.com/for/${slug || "mylove"}`;
    const letter = safeMessage
      ? safeMessage + (safeSender ? `\n\n— ${safeSender}` : "")
      : `Dear ${safeRecipient || "my love"},\n\nYou came into my life and changed everything. Every moment with you feels like home.\n\nI just wanted you to know — you are seen, you are cherished, and you are deeply loved.\n\n${
          safeSender ? `— ${safeSender}` : "— Your person ♡"
        }`;

    return { title, url, letter };
  }, [occasion, headline, recipient, sender, message]);

  const handlePhotosChange = (images: UploadResult[]) => {
    const urls = images.map((image) => image.secure_url).filter(Boolean);
    form.setValue("photos", urls, { shouldValidate: true });
  };

  const searchMusic = async () => {
    const query = musicQuery.trim();
    if (!query) return;

    setIsSearchingMusic(true);
    setMusicError("");
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setMusicResults([]);
        setMusicError(data?.error || "Failed to search Spotify tracks");
        return;
      }

      setMusicResults(data as SpotifyTrackResult[]);
    } catch {
      setMusicResults([]);
      setMusicError("Could not search songs right now. Please try again.");
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const handlePreview = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      // Ensure template goes to backend
      template: values.template,
      photos: values.photos ?? [],
      music: values.music
        ? {
            track_id: values.music.track_id,
            name: values.music.name,
            artist_name: values.music.artist_name,
            spotify_url: values.music.spotify_url,
            album_image: values.music.album_image,
          }
        : null,
    };

    setIsSavingMoment(true);
    setSaveError("");

    try {
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || "Failed to save this moment";
        toast.error(errorMessage);
        setSaveError(errorMessage);
        return;
      }

      setSavedMoment(data as CreatedMomentRecord);
      setSuccessModalOpen(true);
      toast.success("Moment message has been saved successful ❤️");
    } catch {
      const mess = "Could not save moment right now. Please try again.";
      toast.error(mess);
      setSaveError(mess);
      return;
    } finally {
      setIsSavingMoment(false);
    }
  });

  const selectTrack = (track: SpotifyTrackResult) => {
    form.setValue(
      "music",
      {
        track_id: track.trackId,
        name: track.name,
        artist_name: track.artist,
        spotify_url: track.spotifyUrl ?? "",
        album_image: track.albumImage,
      },
      { shouldValidate: true },
    );
  };

  const getWhatsappLink = () => {
    if (!recipient_phone || !/^\d{11}$/.test(recipient_phone)) return "";
    const phone = "234" + recipient_phone.slice(1);
    const baseUrl = "https://wa.me/" + phone;
    let shareText = `I created something special for you`;
    if (savedMoment) {
      const safeRecipient = recipient?.trim() || "";
      const slug = safeRecipient.toLowerCase().replace(/[^a-z0-9]/g, "");
      const momentUrl = `https://2usforever.com/for/${slug || "mylove"}`;
      shareText = `I created something special for you: ${momentUrl}`;
    }
    return `${baseUrl}?text=${encodeURIComponent(shareText)}`;
  };

  const generateMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const response = await fetch("/api/gemini/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Failed to generate message");
        return;
      }
      form.setValue("message", data.message);
      toast.success("Generated love message");
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const improveMessage = async () => {
    const currentMessage = form.getValues("message");
    if (!currentMessage?.trim()) {
      toast.error("Write a message first, then I can improve it");
      return;
    }
    setIsImprovingMessage(true);
    try {
      const response = await fetch("/api/gemini/improve-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, message: currentMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Failed to improve message");
        return;
      }
      form.setValue("message", data.message);
      toast.success("Message improved");
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsImprovingMessage(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      const valid = await form.trigger(["recipient"]);
      if (!valid) return;
    }
    if (step === 5) {
      // validate template selection on template step before moving on
      const valid = await form.trigger("template");
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <section className="builder-section" id="create">
      <div className="builder-inner">
        <h2 className="builder-title">Create your moment ✨</h2>
        <p className="builder-sub">
          Follow the steps below to build your love page.
        </p>

        {/* Step indicator */}
        <div className="flex items-start justify-center mb-10">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold border-2 transition-all duration-200
                      ${
                        isActive
                          ? "bg-[#B8435A] border-[#B8435A] text-white shadow-sm"
                          : isDone
                            ? "bg-[rgba(184,67,90,0.08)] border-[#B8435A] text-[#B8435A]"
                            : "bg-white border-[rgba(184,67,90,0.2)] text-[#A88090]"
                      }`}
                  >
                    {isDone ? "✓" : n}
                  </div>
                  <span
                    className={`text-[10px] hidden sm:block font-medium tracking-wide leading-none transition-colors
                      ${isActive ? "text-[#B8435A]" : isDone ? "text-[#B8435A]/60" : "text-[#C0A0A8]"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-px mx-1 mb-4 transition-all duration-200
                      ${isDone ? "bg-[#B8435A]" : "bg-[rgba(184,67,90,0.15)]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Choose Occasion ── */}
        {step === 1 && (
          <div>
            <div className="form-row">
              <label>What&apos;s the occasion?</label>
              <div className="relative">
                <div
                  className={`pointer-events-none absolute left-0 top-0 bottom-1 w-12 z-10 transition-opacity duration-200
                    bg-gradient-to-r from-[#FAF6F0] to-transparent rounded-l-2xl
                    ${showLeft ? "opacity-100" : "opacity-0"}`}
                />
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => nudge(-1)}
                  className={`absolute left-[-10px] top-1/2 translate-y-[-60%] z-20
                    w-7 h-7 rounded-full bg-[#7A1A2A] border-[1.5px] border-[rgba(184,67,90,0.2)]
                    text-[#FAF6F0] text-sm flex items-center justify-center
                    hover:bg-[#FAF6F0] hover:text-[#7A1A2A] hover:border-[#7A1A2A] cursor-pointer
                    transition-all duration-150
                    ${showLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronLeft />
                </button>

                <div
                  ref={scrollerRef}
                  onScroll={updateFades}
                  className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 px-0.5 scroll-smooth"
                  style={{ scrollbarWidth: "none" }}
                >
                  {OCCASIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={`pill shrink-0 ${occasion === item ? "active" : ""}`}
                      onClick={() =>
                        form.setValue("occasion", item, {
                          shouldValidate: true,
                        })
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div
                  className={`pointer-events-none absolute right-0 top-0 bottom-1 w-12 z-10 transition-opacity duration-200
                    bg-gradient-to-l from-[#FAF6F0] to-transparent rounded-r-2xl
                    ${showRight ? "opacity-100" : "opacity-0"}`}
                />
                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => nudge(1)}
                  className={`absolute right-[-10px] top-1/2 translate-y-[-60%] z-20
                    w-7 h-7 rounded-full bg-[#7A1A2A] border-[1.5px] border-[rgba(184,67,90,0.2)]
                    text-[#FAF6F0] text-sm flex items-center justify-center
                    hover:bg-[#FAF6F0] hover:text-[#7A1A2A] hover:border-[#7A1A2A] cursor-pointer
                    transition-all duration-150
                    ${showRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="form-row">
              <label>Who is this for?</label>
              <input
                type="text"
                {...form.register("recipient")}
                placeholder="e.g. Jessica, My love, Babe…"
              />
              {form.formState.errors.recipient ? (
                <p className="field-error">
                  {form.formState.errors.recipient.message}
                </p>
              ) : null}
            </div>

            <div className="form-row">
              <label>Page headline (optional)</label>
              <input
                type="text"
                {...form.register("headline")}
                placeholder="e.g. For the love of my life ✨"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Write Message ── */}
        {step === 2 && (
          <div>
            <div className="form-row">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <label className="mb-0 mr-auto">
                  Your message (or let AI help)
                </label>
                <button
                  type="button"
                  onClick={generateMessage}
                  disabled={isGeneratingMessage || isImprovingMessage}
                  className="flex items-center gap-1 cursor-pointer text-[#C8516A] bg-[#C8516A]/5 rounded-full px-3 border-[0.5px] border-[#C8516A] text-[13px] py-1 font-medium tracking-tight disabled:opacity-50"
                >
                  {isGeneratingMessage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate with AI
                </button>
                <button
                  type="button"
                  onClick={improveMessage}
                  disabled={isGeneratingMessage || isImprovingMessage}
                  className="flex items-center gap-1 cursor-pointer text-[#7A1A2A] bg-[#7A1A2A]/5 rounded-full px-3 border-[0.5px] border-[#7A1A2A] text-[13px] py-1 font-medium tracking-tight disabled:opacity-50"
                >
                  {isImprovingMessage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Improve message
                </button>
              </div>
              <textarea
                {...form.register("message")}
                disabled={isGeneratingMessage || isImprovingMessage}
                placeholder="Write from the heart. Even a few words are enough to start…"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Upload Photos ── */}
        {step === 3 && (
          <div>
            <div className="form-row">
              <label>Upload photos (up to 5)</label>
              <div className="photo-upload-grid">
                <CustomImagePicker
                  onImagesChange={handlePhotosChange}
                  initialImages={photos}
                  maxImages={5}
                  folder="2usforever"
                />
              </div>
              <p className="builder-helper">{photos.length} / 5 uploaded</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Pick Song ── */}
        {step === 4 && (
          <div>
            <div className="form-row">
              <label>Music</label>

              {selectedMusic ? (
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl border border-[rgba(184,67,90,0.15)] bg-white">
                  {selectedMusic.album_image ? (
                    <Image
                      src={selectedMusic.album_image}
                      alt={selectedMusic.name}
                      width={48}
                      height={48}
                      className="rounded-lg shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#F0EAE4] flex items-center justify-center text-lg shrink-0">
                      🎵
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A0810] truncate">
                      {selectedMusic.name}
                    </p>
                    <p className="text-xs text-[#A88090] mt-0.5 truncate">
                      {selectedMusic.artist_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue("music", undefined, {
                        shouldValidate: true,
                      })
                    }
                    className="text-xs text-[#A88090] hover:text-[#B8435A] transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <Button
                type="button"
                className="music-select-btn truncate whitespace-nowrap max-sm:text-left px-3"
                onClick={() => setIsMusicModalOpen(true)}
                variant="outline"
              >
                {selectedMusic ? "Change song" : "Choose a Spotify track"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Choose Template ── */}
        {step === 5 && (
          <div>
            <div className="form-row">
              <label>Choose a template</label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((t) => {
                  const isSelected = selectedTemplate === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      // use form.setValue for template selection
                      onClick={() =>
                        form.setValue("template", t.id, {
                          shouldValidate: true,
                        })
                      }
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${
                          isSelected
                            ? "border-[#B8435A] bg-[rgba(184,67,90,0.04)]"
                            : "border-[rgba(184,67,90,0.15)] bg-white hover:border-[rgba(184,67,90,0.35)]"
                        }`}
                    >
                      <span className="text-2xl block mb-2">{t.emoji}</span>
                      <p className="text-sm font-medium text-[#1A0810] leading-snug">
                        {t.name}
                      </p>
                      <p className="text-xs text-[#A88090] mt-1 leading-snug">
                        {t.description}
                      </p>
                      {isSelected ? (
                        <span className="text-[11px] text-[#B8435A] font-semibold mt-2 block">
                          Selected ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {/* Show validation error if any */}
              {form.formState.errors.template ? (
                <p className="field-error">
                  {form.formState.errors.template.message}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* ── Step 6: Preview + Pay ── */}
        {step === 6 && (
          <div>
            <div className="preview-box shown mb-6">
              <h4>{preview.title}</h4>
              <p className="preview-url">{preview.url}</p>
              {selectedMusic ? (
                <p className="preview-music">
                  Song: {selectedMusic.name} — {selectedMusic.artist_name}
                </p>
              ) : null}
              {photos.length > 0 ? (
                <p className="preview-music">
                  Photos selected: {photos.length}
                </p>
              ) : null}
              <p className="preview-letter">{preview.letter}</p>
              {/* Optionally show template name preview */}
              {selectedTemplate && (
                <p className="preview-music">
                  Template:{" "}
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                </p>
              )}
            </div>

            <div className="form-row">
              <label>Your email</label>
              <input
                type="email"
                {...form.register("sender_email")}
                placeholder="your@email.com"
              />
              {form.formState.errors.sender_email ? (
                <p className="field-error">
                  {form.formState.errors.sender_email.message}
                </p>
              ) : null}
            </div>

            <div className="form-row">
              <label>Recipient&apos;s email (optional)</label>
              <input
                type="email"
                {...form.register("recipient_email")}
                placeholder="their@email.com"
              />
              {form.formState.errors.recipient_email &&
              form.getValues("recipient_email") ? (
                <p className="field-error">
                  {form.formState.errors.recipient_email.message}
                </p>
              ) : null}
            </div>

            <div className="form-row">
              <label>
                Recipient&apos;s phone (11 digits, e.g. 08012345678)
              </label>
              <input
                type="tel"
                {...form.register("recipient_phone")}
                placeholder="08012345678"
                maxLength={11}
                pattern="[0-9]{11}"
                inputMode="numeric"
              />
              {form.formState.errors.recipient_phone ? (
                <p className="field-error">
                  {form.formState.errors.recipient_phone.message}
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              className="form-submit h-14"
              onClick={handlePreview}
              disabled={isSavingMoment}
            >
              {isSavingMoment ? "Saving…" : "Save ✨"}
            </Button>
            {saveError ? <p className="field-error">{saveError}</p> : null}
          </div>
        )}

        {/* ── Step navigation ── */}
        <div
          className={`flex mt-8 ${step > 1 ? "justify-between" : "justify-end"}`}
        >
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="rounded-full px-6 py-5 border-[rgba(184,67,90,0.2)] text-[#6B4050] hover:border-[#B8435A] hover:text-[#B8435A] hover:bg-[rgba(184,67,90,0.04)] font-normal text-sm"
            >
              ← Back
            </Button>
          ) : null}

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={goNext}
              className="rounded-full px-6 py-5 bg-[#B8435A] hover:bg-[#7A1A2A] text-white font-medium text-sm border-0"
            >
              Next →
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── Music search modal ── */}
      <Dialog open={isMusicModalOpen} onOpenChange={setIsMusicModalOpen}>
        <DialogContent
          className="p-0 max-w-md max-sm:w-dvw max-sm:h-dvh overflow-hidden border border-[rgba(184,67,90,0.18)] rounded-[20px] bg-[#FAF6F0] shadow-xl gap-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-[#7A1A2A] h-40 px-6 pt-6 pb-8">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full border border-[rgba(196,149,58,0.4)] bg-[rgba(196,149,58,0.1)] flex items-center justify-center text-lg shrink-0 mt-0.5">
                🎵
              </div>
              <div className="flex-1">
                <DialogTitle className="font-['Cormorant_Garamond'] text-[22px] font-normal text-white leading-snug mb-1">
                  Choose a song
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/50 font-light leading-relaxed">
                  Search Spotify · One track sets the mood for their whole
                  experience
                </DialogDescription>
              </div>
            </div>
            <div className="absolute -bottom-px left-0 right-0 h-5 bg-[#FAF6F0] rounded-t-[50%] scale-x-[1.05]" />
          </div>

          <div className="pt-5 grow pb-5">
            <div className="flex gap-2 px-5 items-center mb-4">
              <input
                type="text"
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                placeholder="Try: all of me, perfect, endless love…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchMusic();
                }}
                className="flex-1 px-4 py-[11px] grow border-[1.5px] border-[rgba(184,67,90,0.18)] rounded-xl text-[13px] font-['Jost'] bg-white text-[#1A0810] outline-none focus:border-[#B8435A] transition-colors placeholder:text-[#C0A0A8]"
              />
              <Button
                type="button"
                onClick={searchMusic}
                disabled={isSearchingMusic}
                className="bg-[#B8435A] hover:bg-[#7A1A2A] py-5 text-white rounded-xl px-5 text-[13px] font-medium border-0 shrink-0 transition-colors"
              >
                {isSearchingMusic ? "…" : "Search"}
              </Button>
            </div>

            {musicError ? (
              <p className="text-[12px] px-5 text-[#B8435A] mb-3 font-light">
                {musicError}
              </p>
            ) : musicResults.length > 0 ? (
              <p className="text-[11px] px-5 text-[#A88090] mb-3 font-light">
                {musicResults.length} result
                {musicResults.length !== 1 ? "s" : ""}
              </p>
            ) : !isSearchingMusic ? (
              <p className="text-[11px] px-5 text-[#A88090] mb-3 font-light">
                Search for a song to see results
              </p>
            ) : null}

            <div className="flex px-5 flex-col gap-2 mb-4 h-full max-h-[280px] overflow-y-auto w-full">
              {musicResults.map((track) => {
                const isActive = selectedMusic?.track_id === track.trackId;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => selectTrack(track)}
                    className={`flex items-center gap-3 justify-between rounded-xl px-3 py-2.5 border-[1.5px] text-left transition-all w-full
                      ${
                        isActive
                          ? "border-[#B8435A] bg-[rgba(184,67,90,0.04)]"
                          : "border-[rgba(184,67,90,0.12)] bg-white hover:border-[rgba(184,67,90,0.3)]"
                      }`}
                  >
                    {track.albumImage ? (
                      <Image
                        src={track.albumImage}
                        alt={track.name}
                        width={44}
                        height={44}
                        className="rounded-lg shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-[#F0EAE4] flex items-center justify-center text-lg shrink-0">
                        🎵
                      </div>
                    )}

                    <div className="grow">
                      <p className="text-[13px] min-[376px]:block hidden line-clamp-1 font-medium text-[#1A0810] truncate leading-tight">
                        {track.name.slice(0, 33)}
                        {track.name.length > 33 ? "..." : ""}
                      </p>
                      <p className="text-[13px] line-clamp-1 max-[376px]:block hidden font-medium text-[#1A0810] truncate leading-tight">
                        {track.name.slice(0, 22)}
                        {track.name.length > 22 ? "..." : ""}
                      </p>
                      <p className="text-[11px] min-[376px]:block hidden text-[#A88090] mt-0.5 truncate">
                        {track.artist.slice(0, 33)}
                        {track.artist.length > 33 ? "..." : ""}
                      </p>
                      <p className="text-[11px] max-[376px]:block hidden text-[#A88090] mt-0.5 truncate">
                        {track.artist.slice(0, 22)}
                        {track.artist.length > 22 ? "..." : ""}
                      </p>
                    </div>

                    <div
                      className={`w-[22px] h-[22px] ml-auto rounded-full border-[1.5px] flex items-center justify-center text-[11px] shrink-0 transition-all
                        ${
                          isActive
                            ? "bg-[#B8435A] border-[#B8435A] text-white"
                            : "border-[rgba(184,67,90,0.25)] text-transparent"
                        }`}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[rgba(184,67,90,0.1)] pt-4 px-5 flex justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="bg-[#B8435A] hover:bg-[#7A1A2A] text-white rounded-full px-7 text-[13px] font-medium border-0 transition-colors"
                >
                  {selectedMusic ? "Done — use this song ✓" : "Done"}
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Success modal ── */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="p-0 max-w-[420px] overflow-hidden border border-[rgba(184,67,90,0.18)] rounded-[20px] bg-[#FAF6F0] shadow-xl gap-0">
          <div className="relative bg-[#7A1A2A] flex flex-col px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-full border border-[rgba(196,149,58,0.45)] bg-[rgba(196,149,58,0.1)] flex items-center justify-center mx-auto mb-4 text-3xl">
              🌹
            </div>

            <DialogTitle className="font-playfair text-[26px] font-medium text-white leading-snug tracking-wide mb-2">
              Their page is <em className="italic text-[#E8C882]">ready</em>
            </DialogTitle>

            <DialogDescription className="text-[13px] text-white/55 font-light leading-relaxed max-w-[280px] mx-auto">
              Share this link and let the moment unfold. They&apos;ll feel
              everything you built.
            </DialogDescription>

            <div className="absolute -bottom-px left-0 right-0 h-7 bg-[#FAF6F0] rounded-t-[50%] scale-x-[1.04]" />
          </div>

          <div className="px-7 pt-7 pb-6">
            {savedMoment && (
              <>
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#A88090] mb-2">
                  Their private link
                </p>

                <div className="flex items-center gap-2.5 bg-white border border-[rgba(184,67,90,0.15)] rounded-xl px-3.5 py-3 mb-3">
                  <Link
                    href={
                      recipient
                        ? `https://2usforever.com/for/${recipient.toLowerCase().replace(/[^a-z0-9]/g, "") || "mylove"}`
                        : "https://2usforever.com/"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#B8435A] break-all leading-snug flex-1 hover:underline"
                  >
                    {recipient
                      ? `2usforever.com/for/${recipient.toLowerCase().replace(/[^a-z0-9]/g, "") || "mylove"}`
                      : "2usforever.com/"}
                  </Link>
                  <Button
                    size="sm"
                    className="shrink-0 bg-[#B8435A] hover:bg-[#7A1A2A] text-white text-xs font-medium rounded-lg px-3.5 h-8 border-0"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://2usforever.com/for/${recipient?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mylove"}`,
                      );
                    }}
                  >
                    Copy
                  </Button>
                </div>

                {recipient_phone && /^\d{11}$/.test(recipient_phone) && (
                  <Link
                    href={getWhatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#F0EAE4] hover:bg-[#E8F5EC] border border-[rgba(184,67,90,0.15)] hover:border-[#25D366] rounded-xl py-3 text-sm font-medium text-[#1A0810] hover:text-[#1A3A1A] transition-all mb-4 no-underline"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-white text-[11px] flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    Send to their WhatsApp
                  </Link>
                )}
              </>
            )}

            <div className="h-px bg-[rgba(184,67,90,0.1)] mb-4" />

            <DialogFooter className="flex-row gap-2.5 sm:justify-between">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="rounded-full py-5 border-[rgba(184,67,90,0.2)] text-[#6B4050] hover:border-[#B8435A] hover:text-[#B8435A] hover:bg-[rgba(184,67,90,0.04)] font-normal text-sm px-5"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                className="rounded-full bg-[#B8435A] py-5 hover:bg-[#7A1A2A] text-white font-medium text-sm px-5 border-0"
                onClick={() => setSuccessModalOpen(false)}
              >
                Create another →
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
