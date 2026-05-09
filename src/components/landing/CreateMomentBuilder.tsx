"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import CustomImagePicker from "../custom-image-picker";
import { UploadResult } from "@/services/cloudinary.service";
// Import Dialog components from shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cormorant_Garamond, Playfair_Display } from "next/font/google";

const OCCASIONS = [
  "💌 Love Note",
  "💍 Proposal",
  "💑 Anniversary",
  "🎂 Birthday",
  "✈️ Surprise Drop",
  "🎊 Apology",
];

const musicSchema = z.object({
  track_id: z.string().min(1),
  name: z.string().min(1),
  artist_name: z.string().min(1),
  spotify_url: z.string().url(),
  album_image: z.string().url().nullable(),
});

const createMomentSchema = z.object({
  occasion: z.string().min(1, "Please select an occasion"),
  headline: z.string().trim().max(120).optional(),
  recipient: z.string().trim().min(1, "Their name is required"),
  message: z.string().trim().max(2000).optional(),
  sender: z.string().trim().max(120).optional(),
  photos: z.array(z.string().url()).max(8).optional(),
  music: musicSchema.optional(),
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
};

export default function CreateMomentBuilder() {
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
      sender_email: "",
      recipient_email: "",
      recipient_phone: "",
    },
  });

  const occasion = useWatch({ control: form.control, name: "occasion" });
  const headline = useWatch({ control: form.control, name: "headline" }) ?? "";
  const recipient = useWatch({ control: form.control, name: "recipient" });
  const message = useWatch({ control: form.control, name: "message" });
  const sender = useWatch({ control: form.control, name: "sender" });
  const selectedMusic = useWatch({ control: form.control, name: "music" });
  const photos = useWatch({ control: form.control, name: "photos" }) ?? [];
  const sender_email = useWatch({
    control: form.control,
    name: "sender_email",
  });
  const recipient_email =
    useWatch({
      control: form.control,
      name: "recipient_email",
    }) ?? "";
  const recipient_phone = useWatch({
    control: form.control,
    name: "recipient_phone",
  });

  const [showPreview, setShowPreview] = useState(false);
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
        setSaveError(data?.error || "Failed to save this moment");
        return;
      }

      setSavedMoment(data as CreatedMomentRecord);
      setSuccessModalOpen(true);
      // Remove the builder-level preview success state.
      setShowPreview(false);
      // console.log("Saved moment record:", data);
    } catch {
      setSaveError("Could not save moment right now. Please try again.");
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

  // WhatsApp helper for "234xxxxxxxxxx"
  const getWhatsappLink = () => {
    if (!recipient_phone || !/^\d{11}$/.test(recipient_phone)) return "";
    // Nigerian numbers are "080xxxxxxx", must be converted to "23480xxxxxxx"
    // Drop the initial 0, prepend 234
    const phone = "234" + recipient_phone.slice(1);
    const baseUrl = "https://wa.me/" + phone;
    let shareText = `I created something special for you`;
    if (savedMoment) {
      // If we have a moment url or similar, include it
      const safeRecipient = recipient?.trim() || "";
      const slug = safeRecipient.toLowerCase().replace(/[^a-z0-9]/g, "");
      const momentUrl = `https://2usforever.com/for/${slug || "mylove"}`;
      shareText = `I created something special for you: ${momentUrl}`;
    }
    const waUrl = `${baseUrl}?text=${encodeURIComponent(shareText)}`;
    return waUrl;
  };

  return (
    <section className="builder-section" id="create">
      <div className="builder-inner">
        <h2 className="builder-title">Create your moment ✨</h2>
        <p className="builder-sub">
          Fill in the details below and we&apos;ll preview your love page
          instantly.
        </p>

        <div className="form-row">
          <label>What&apos;s the occasion?</label>
          <div className="occasion-pills">
            {OCCASIONS.map((item) => (
              <button
                type="button"
                key={item}
                className={`pill ${occasion === item ? "active" : ""}`}
                onClick={() =>
                  form.setValue("occasion", item, { shouldValidate: true })
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label>Headline for the page</label>
          <input
            type="text"
            {...form.register("headline")}
            placeholder="e.g. For the love of my life ✨"
          />
        </div>

        <div className="form-row">
          <label>Their name</label>
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
          <label>Recipient&apos;s phone (11 digits, e.g. 08012345678)</label>
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

        <div className="form-row">
          <label>Your message (or we&apos;ll help you write it)</label>
          <textarea
            {...form.register("message")}
            placeholder="Write from the heart. Even a few words are enough to start…"
          />
        </div>

        <div className="form-row">
          <label>Upload photos (up to 8)</label>
          <div className="photo-upload-grid">
            <CustomImagePicker
              onImagesChange={handlePhotosChange}
              initialImages={photos}
              maxImages={8}
              folder="2usforever"
            />
          </div>
          <p className="builder-helper">{photos.length} / 8 uploaded</p>
        </div>

        <div className="form-row">
          <label>Music</label>
          <Button
            type="button"
            className="music-select-btn"
            onClick={() => setIsMusicModalOpen(true)}
            variant="outline"
          >
            {selectedMusic
              ? `Selected: ${selectedMusic.name} — ${selectedMusic.artist_name}`
              : "Choose a Spotify track"}
          </Button>
        </div>

        <div className="form-row">
          <label>Your name / how you sign it</label>
          <input
            type="text"
            {...form.register("sender")}
            placeholder="e.g. Your Kingsley, Forever yours, Temi…"
          />
        </div>

        <Button
          type="button"
          className="form-submit h-14"
          onClick={handlePreview}
          disabled={isSavingMoment}
        >
          {isSavingMoment ? "Saving..." : "Save & preview my moment →"}
        </Button>
        {saveError ? <p className="field-error">{saveError}</p> : null}
        {/* No more builder-level success note. Modal is now used. */}

        <div className={`preview-box ${showPreview ? "shown" : ""}`}>
          <h4>{preview.title}</h4>
          <p className="preview-url">{preview.url}</p>
          {selectedMusic ? (
            <p className="preview-music">
              Song: {selectedMusic.name} — {selectedMusic.artist_name}
            </p>
          ) : null}
          {photos.length > 0 ? (
            <p className="preview-music">Photos selected: {photos.length}</p>
          ) : null}
          <p className="preview-letter">{preview.letter}</p>
        </div>
      </div>

      {/* ShadCN Modal for Music Search */}
      <Dialog open={isMusicModalOpen} onOpenChange={setIsMusicModalOpen}>
        <DialogContent
          className="p-0 max-w-md overflow-hidden border border-[rgba(184,67,90,0.18)] rounded-[20px] bg-[#FAF6F0] shadow-xl gap-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-[#7A1A2A] px-6 pt-6 pb-8">
            <div className="flex items-start justify-between gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full border border-[rgba(196,149,58,0.4)] bg-[rgba(196,149,58,0.1)] flex items-center justify-center text-lg shrink-0 mt-0.5">
                🎵
              </div>
              {/* Text */}
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
            {/* Scallop edge */}
            <div className="absolute -bottom-px left-0 right-0 h-5 bg-[#FAF6F0] rounded-t-[50%] scale-x-[1.05]" />
          </div>

          {/* Body */}
          <div className="px-6 pt-5 pb-5">
            {/* Search row */}
            <div className="flex gap-2 items-center mb-4">
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

            {/* Result count / error */}
            {musicError ? (
              <p className="text-[12px] text-[#B8435A] mb-3 font-light">
                {musicError}
              </p>
            ) : musicResults.length > 0 ? (
              <p className="text-[11px] text-[#A88090] mb-3 font-light">
                {musicResults.length} result
                {musicResults.length !== 1 ? "s" : ""}
              </p>
            ) : !isSearchingMusic ? (
              <p className="text-[11px] text-[#A88090] mb-3 font-light">
                Search for a song to see results
              </p>
            ) : null}

            {/* Track list */}
            <div className="flex flex-col gap-2 mb-4 max-h-[280px] overflow-y-auto pr-0.5">
              {musicResults.map((track) => {
                const isActive = selectedMusic?.track_id === track.trackId;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => selectTrack(track)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border-[1.5px] text-left transition-all w-full
                ${
                  isActive
                    ? "border-[#B8435A] bg-[rgba(184,67,90,0.04)]"
                    : "border-[rgba(184,67,90,0.12)] bg-white hover:border-[rgba(184,67,90,0.3)]"
                }`}
                  >
                    {/* Album art */}
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

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1A0810] truncate leading-tight">
                        {track.name}
                      </p>
                      <p className="text-[11px] text-[#A88090] mt-0.5 truncate">
                        {track.artist}
                      </p>
                    </div>

                    {/* Check */}
                    <div
                      className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] shrink-0 transition-all
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

            {/* Footer */}
            <div className="border-t border-[rgba(184,67,90,0.1)] pt-4 flex justify-end">
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

      {/* ShadCN Modal for moment success */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="p-0 max-w-[420px] overflow-hidden border border-[rgba(184,67,90,0.18)] rounded-[20px] bg-[#FAF6F0] shadow-xl gap-0">
          {/* Top — deep rose header with scallop edge */}
          <div className="relative bg-[#7A1A2A] flex flex-col px-8 py-8 text-center">
            {/* Wax seal */}
            <div className="w-16 h-16 rounded-full border border-[rgba(196,149,58,0.45)] bg-[rgba(196,149,58,0.1)] flex items-center justify-center mx-auto mb-4 text-3xl">
              🌹
            </div>

            <DialogTitle
              className={`font-playfair text-[26px] font-medium text-white leading-snug tracking-wide mb-2`}
            >
              Their page is <em className="italic text-[#E8C882]">ready</em>
            </DialogTitle>

            <DialogDescription className="text-[13px] text-white/55 font-light leading-relaxed max-w-[280px] mx-auto">
              Share this link and let the moment unfold. They&apos;ll feel
              everything you built.
            </DialogDescription>

            {/* Scallop edge */}
            <div className="absolute -bottom-px left-0 right-0 h-7 bg-[#FAF6F0] rounded-t-[50%] scale-x-[1.04]" />
          </div>

          {/* Body */}
          <div className="px-7 pt-7 pb-6">
            {savedMoment && (
              <>
                {/* Link label */}
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#A88090] mb-2">
                  Their private link
                </p>

                {/* Link box */}
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

                {/* WhatsApp — only shown when phone is valid */}
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

            {/* Divider */}
            <div className="h-px bg-[rgba(184,67,90,0.1)] mb-4" />

            {/* Footer */}
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
