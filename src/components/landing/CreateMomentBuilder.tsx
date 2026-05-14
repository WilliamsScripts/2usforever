"use client";

import Image from "next/image";
import CustomImagePicker from "../custom-image-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { todayDateInputValue } from "@/lib/scheduled-date";
import { cn } from "@/lib/utils";
import { useCreateMomentBuilder } from "@/hooks/useCreateMomentBuilder";
import {
  BUILDER_STEP_LABELS,
  BUILDER_TOTAL_STEPS,
  OCCASIONS,
} from "@/types/moment";

export default function CreateMomentBuilder() {
  const {
    TEMPLATES,
    form,
    step,
    goNext,
    goBack,
    occasion,
    recipient,
    message,
    selectedMusic,
    photos,
    recipientPhone,
    selectedTemplate,
    scheduledDate,
    deliveryTiming,
    setImmediateDelivery,
    setScheduledDelivery,
    preview,
    handlePhotosChange,
    isMusicModalOpen,
    setIsMusicModalOpen,
    musicQuery,
    setMusicQuery,
    musicResults,
    isSearchingMusic,
    musicError,
    searchMusic,
    selectTrack,
    handleSave,
    isSavingMoment,
    saveError,
    savedMoment,
    successModalOpen,
    setSuccessModalOpen,
    generateMessage,
    improveMessage,
    isGeneratingMessage,
    isImprovingMessage,
    whatsappLink,
    scrollerRef,
    showLeft,
    showRight,
    updateFades,
    nudge,
  } = useCreateMomentBuilder();

  return (
    <section className="builder-section overflow-x-hidden" id="create">
      <div className="builder-inner min-w-0">
        <h2 className="builder-title">Create your moment ✨</h2>
        <p className="builder-sub">
          Follow the steps below to build your love page.
        </p>

        {/* Mobile progress bar */}
        <div className="mb-6 sm:hidden">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-[#1A0810]">
              {BUILDER_STEP_LABELS[step - 1]}
            </p>
            <p className="shrink-0 text-[11px] text-[#A88090]">
              {step} / {BUILDER_TOTAL_STEPS}
            </p>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[rgba(184,67,90,0.12)]"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={BUILDER_TOTAL_STEPS}
            aria-label={`Step ${step} of ${BUILDER_TOTAL_STEPS}`}
          >
            <div
              className="h-full rounded-full bg-[#B8435A] transition-all duration-300 ease-out"
              style={{ width: `${(step / BUILDER_TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicator — desktop/tablet only */}
        <div className="mb-6 hidden max-w-full items-start justify-center sm:mb-10 sm:flex">
          {BUILDER_STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={n} className="flex shrink-0 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200 sm:h-8 sm:w-8 sm:text-[13px]
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
                {i < BUILDER_STEP_LABELS.length - 1 && (
                  <div
                    className={`mx-0.5 mb-4 h-px w-3 transition-all duration-200 sm:mx-1 sm:w-10
                      ${isDone ? "bg-[#B8435A]" : "bg-[rgba(184,67,90,0.15)]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: You, occasion & recipient ── */}
        {step === 1 && (
          <div>
            <div className="form-row">
              <label>Your name (feel free to use your pet name)</label>
              <input
                type="text"
                {...form.register("sender")}
                placeholder="e.g. Alex, Your love, Babe…"
              />
              {form.formState.errors.sender ? (
                <p className="field-error">
                  {form.formState.errors.sender.message}
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
              <label>What&apos;s the occasion?</label>
              <div className="relative px-8 sm:px-0">
                <div
                  className={`pointer-events-none absolute left-0 top-0 bottom-1 w-12 z-10 transition-opacity duration-200
                    bg-gradient-to-r from-[#FAF6F0] to-transparent rounded-l-2xl
                    ${showLeft ? "opacity-100" : "opacity-0"}`}
                />
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => nudge(-1)}
                  className={`absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[rgba(184,67,90,0.2)] bg-[#7A1A2A] text-sm text-[#FAF6F0] transition-all duration-150 hover:border-[#7A1A2A] hover:bg-[#FAF6F0] hover:text-[#7A1A2A] sm:left-[-10px] sm:translate-y-[-60%]
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
                  className={`absolute right-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[rgba(184,67,90,0.2)] bg-[#7A1A2A] text-sm text-[#FAF6F0] transition-all duration-150 hover:border-[#7A1A2A] hover:bg-[#FAF6F0] hover:text-[#7A1A2A] sm:right-[-10px] sm:translate-y-[-60%]
                    ${showRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="form-row">
              <label>Who is this for? (feel free to use their pet name)</label>
              <input
                type="text"
                {...form.register("recipient")}
                placeholder="e.g. Jessica, My love, Babe, Bae…"
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
              <label className="mb-2">Your message (or let AI help)</label>

              <textarea
                {...form.register("message")}
                disabled={isGeneratingMessage || isImprovingMessage}
                placeholder="Write from the heart. Even a few words are enough to start…"
                style={{ minHeight: "180px" }}
              />
              <div className="flex flex-wrap items-center gap-2 my-2">
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
              <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
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
                      className={`p-4 cursor-pointer rounded-xl border-2 text-left transition-all duration-200
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
              {deliveryTiming === "scheduled" && scheduledDate ? (
                <p className="preview-music">Opens on: {scheduledDate}</p>
              ) : null}
            </div>

            <div className="form-row">
              <Label className="mb-3 block text-[#1A0810] font-medium">
                When should they see this?{" "}
                <span className="font-normal text-[#A88090]">(optional)</span>
              </Label>

              <RadioGroup
                value={deliveryTiming}
                onValueChange={(value) => {
                  if (value === "immediate") setImmediateDelivery();
                  if (value === "scheduled") setScheduledDelivery();
                }}
                className="grid grid-cols-2 gap-2 sm:gap-3"
              >
                <label
                  htmlFor="delivery-immediate"
                  className={cn(
                    "flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-2 py-3 text-center transition-all duration-200 sm:min-h-0 sm:items-stretch sm:justify-start sm:gap-2 sm:p-4 sm:text-left",
                    deliveryTiming === "immediate"
                      ? "border-[#B8435A] bg-[rgba(184,67,90,0.04)] shadow-sm"
                      : "border-[rgba(184,67,90,0.15)] hover:border-[rgba(184,67,90,0.35)] active:border-[rgba(184,67,90,0.35)]",
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5 sm:w-full sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem
                        value="immediate"
                        id="delivery-immediate"
                        className="shrink-0 border-[rgba(184,67,90,0.35)] data-checked:border-[#B8435A] data-checked:bg-[#B8435A]"
                      />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(184,67,90,0.08)] text-[#B8435A] sm:h-7 sm:w-7">
                        <Zap className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </span>
                    </div>
                    <span className="text-xs font-medium leading-tight text-[#1A0810] sm:text-sm">
                      Right away
                    </span>
                  </div>
                  <p className="hidden text-xs leading-relaxed text-[#A88090] sm:block">
                    Open as soon as you share the link.
                  </p>
                </label>
                <label
                  htmlFor="delivery-scheduled"
                  className={cn(
                    "flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-2 py-3 text-center transition-all duration-200 sm:min-h-0 sm:items-stretch sm:justify-start sm:gap-2 sm:p-4 sm:text-left",
                    deliveryTiming === "scheduled"
                      ? "border-[#B8435A] bg-[rgba(184,67,90,0.04)] shadow-sm"
                      : "border-[rgba(184,67,90,0.15)] hover:border-[rgba(184,67,90,0.35)] active:border-[rgba(184,67,90,0.35)]",
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5 sm:w-full sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem
                        value="scheduled"
                        id="delivery-scheduled"
                        className="shrink-0 border-[rgba(184,67,90,0.35)] data-checked:border-[#B8435A] data-checked:bg-[#B8435A]"
                      />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(184,67,90,0.08)] text-[#B8435A] sm:h-7 sm:w-7">
                        <CalendarDays className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </span>
                    </div>
                    <span className="text-xs font-medium leading-tight text-[#1A0810] sm:text-sm">
                      <span className="sm:hidden">Schedule</span>
                      <span className="hidden sm:inline">Pick a date</span>
                    </span>
                  </div>
                  <p className="hidden text-xs leading-relaxed text-[#A88090] sm:block">
                    Unlocks at midnight on the chosen day.
                  </p>
                </label>
              </RadioGroup>

              {deliveryTiming === "scheduled" ? (
                <div
                  className="mt-3 overflow-hidden rounded-2xl border border-[rgba(184,67,90,0.18)] bg-[#FAF6F0] p-4"
                  style={{ animation: "fadeUp 0.35s ease both" }}
                >
                  <Label
                    htmlFor="scheduled_date"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#A88090]"
                  >
                    Pick a date
                  </Label>
                  <input
                    id="scheduled_date"
                    type="date"
                    {...form.register("scheduled_date")}
                    min={todayDateInputValue()}
                    className="w-full rounded-xl border border-[rgba(184,67,90,0.18)] bg-white px-4 py-3 text-sm text-[#1A0810] outline-none transition-colors focus:border-[#B8435A]"
                  />
                  {scheduledDate ? (
                    <p className="mt-3 text-xs text-[#6B4050]">
                      Opens on{" "}
                      <span className="font-medium text-[#B8435A]">
                        {scheduledDate}
                      </span>{" "}
                      at midnight.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-[#A88090]">
                      Choose when they should see your message.
                    </p>
                  )}
                </div>
              ) : null}
              {form.formState.errors.scheduled_date ? (
                <p className="field-error mt-2">
                  {form.formState.errors.scheduled_date.message}
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
              onClick={handleSave}
              disabled={isSavingMoment}
            >
              {isSavingMoment ? "Saving…" : "Save ✨"}
            </Button>
            {saveError ? <p className="field-error">{saveError}</p> : null}
          </div>
        )}

        {/* ── Step navigation ── */}
        <div
          className={`mt-8 flex gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}
        >
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="flex-1 rounded-full border-[rgba(184,67,90,0.2)] px-4 py-2 text-sm font-normal text-[#6B4050] hover:border-[#B8435A] hover:bg-[rgba(184,67,90,0.04)] hover:text-[#B8435A] sm:h-auto sm:flex-none sm:px-6"
            >
              Back
            </Button>
          ) : null}

          {step < BUILDER_TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-full border-0 bg-[#B8435A] px-4 py-2 text-sm font-medium text-white hover:bg-[#7A1A2A] sm:h-auto sm:flex-none sm:px-6"
            >
              Next
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
            <div className="mb-4 flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:px-5">
              <input
                type="text"
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                placeholder="Try: all of me, perfect, endless love…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchMusic();
                }}
                className="w-full grow rounded-xl border-[1.5px] border-[rgba(184,67,90,0.18)] bg-white px-4 py-[11px] text-[13px] font-['Jost'] text-[#1A0810] outline-none transition-colors placeholder:text-[#C0A0A8] focus:border-[#B8435A]"
              />
              <Button
                type="button"
                onClick={searchMusic}
                disabled={isSearchingMusic}
                className="w-full shrink-0 rounded-xl border-0 bg-[#B8435A] px-5 py-5 text-[13px] font-medium text-white transition-colors hover:bg-[#7A1A2A] sm:w-auto"
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
                    className={`flex cursor-pointer items-center gap-3 justify-between rounded-xl px-3 py-2.5 border-[1.5px] text-left transition-all w-full
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
                  Done
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Success modal ── */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-[420px] gap-0 overflow-hidden overflow-y-auto rounded-[20px] border border-[rgba(184,67,90,0.18)] bg-[#FAF6F0] p-0 shadow-xl sm:w-full">
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

          <div className="px-5 pb-6 pt-7 sm:px-7">
            {savedMoment && (
              <>
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#A88090] mb-2">
                  Their private link
                </p>

                <div className="mb-3 flex flex-col gap-2.5 rounded-xl border border-[rgba(184,67,90,0.15)] bg-white px-3.5 py-3 sm:flex-row sm:items-center">
                  <Link
                    href={`https://2usforever.vercel.app/for/${savedMoment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 break-all text-[13px] leading-snug text-[#B8435A] hover:underline"
                  >
                    https://2usforever.vercel.app/for/{savedMoment.id}
                  </Link>
                  <Button
                    size="sm"
                    className="h-9 w-full shrink-0 rounded-lg border-0 bg-[#B8435A] px-3.5 text-xs font-medium text-white hover:bg-[#7A1A2A] sm:w-auto"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://2usforever.vercel.app/for/${savedMoment.id}`,
                      );
                    }}
                  >
                    Copy
                  </Button>
                </div>

                {recipientPhone && /^\d{11}$/.test(recipientPhone) && (
                  <Link
                    href={whatsappLink}
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
                Create another
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
