"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import posthog from "posthog-js";
import { getMoment } from "@/services/moments.service";
import { useTemplates } from "@/context/TemplateContext";
import { todayDateInputValue } from "@/lib/scheduled-date";
import {
  buildCreateMomentPayload,
  buildMomentPreview,
  buildWhatsappShareUrl,
} from "@/lib/moment-preview";
import { useCreateMoment } from "@/hooks/useMoments";
import {
  useGenerateMessage,
  useImproveMessage,
} from "@/hooks/useGeminiMessage";
import { useSpotifySearch } from "@/hooks/useSpotifySearch";
import { useHorizontalScrollFades } from "@/hooks/useHorizontalScrollFades";
import {
  BUILDER_TOTAL_STEPS,
  createMomentSchema,
  OCCASIONS,
  type CreateMomentFormValues,
  type DeliveryTiming,
  type MomentRecord,
} from "@/types/moment";
import type { SpotifyTrack } from "@/types/spotify";
import type { UploadResult } from "@/types/cloudinary";

export function useCreateMomentBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const TEMPLATES = useTemplates();
  const createMomentMutation = useCreateMoment();
  const generateMessageMutation = useGenerateMessage();
  const improveMessageMutation = useImproveMessage();
  const spotifySearchMutation = useSpotifySearch();
  const scrollFades = useHorizontalScrollFades();

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
      scheduled_date: "",
    },
  });

  const occasion = useWatch({ control: form.control, name: "occasion" });
  const headline = useWatch({ control: form.control, name: "headline" }) ?? "";
  const recipient = useWatch({ control: form.control, name: "recipient" });
  const message = useWatch({ control: form.control, name: "message" });
  const sender = useWatch({ control: form.control, name: "sender" });
  const selectedMusic = useWatch({ control: form.control, name: "music" });
  const photos = useWatch({ control: form.control, name: "photos" }) ?? [];
  const recipientPhone = useWatch({
    control: form.control,
    name: "recipient_phone",
  });
  const selectedTemplate = useWatch({
    control: form.control,
    name: "template",
  });
  const scheduledDate =
    useWatch({ control: form.control, name: "scheduled_date" }) ?? "";

  const [step, setStep] = useState(1);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [musicQuery, setMusicQuery] = useState("");
  const [savedMoment, setSavedMoment] = useState<MomentRecord | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deliveryTiming, setDeliveryTiming] =
    useState<DeliveryTiming>("immediate");

  useEffect(() => {
    const payment = searchParams.get("payment");
    const momentId = searchParams.get("moment_id");
    if (payment !== "success" || !momentId) return;

    let cancelled = false;

    void (async () => {
      try {
        const moment = await getMoment(momentId);
        if (cancelled || !moment) {
          toast.error("We could not load your moment after payment");
          return;
        }

        setSavedMoment(moment);
        setSuccessModalOpen(true);
        posthog.capture("moment_payment_returned", { moment_id: moment.id });
        toast.success("Payment successful — your moment is live");
      } catch {
        if (!cancelled) {
          toast.error("Payment received, but we could not load your moment");
        }
      } finally {
        if (!cancelled) {
          router.replace("/create-moment", { scroll: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const preview = useMemo(
    () =>
      buildMomentPreview({
        occasion,
        headline,
        recipient: recipient ?? "",
        sender: sender ?? "",
        message: message ?? "",
      }),
    [occasion, headline, recipient, sender, message],
  );

  const handlePhotosChange = (uploads: UploadResult[]) => {
    const urls = uploads.map((image) => image.secure_url).filter(Boolean);
    form.setValue("photos", urls, { shouldValidate: true });
  };

  const searchMusic = async () => {
    const query = musicQuery.trim();
    if (!query) return;

    try {
      await spotifySearchMutation.mutateAsync(query);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not search songs right now. Please try again.",
      );
    }
  };

  const selectTrack = (track: SpotifyTrack) => {
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
    posthog.capture("music_track_selected", {
      track_name: track.name,
      artist_name: track.artist,
    });
  };

  const handleSave = form.handleSubmit(async (values) => {
    if (deliveryTiming === "scheduled" && !values.scheduled_date) {
      form.setError("scheduled_date", {
        type: "manual",
        message: "Choose a date or send immediately",
      });
      toast.error("Choose a delivery date or send immediately");
      return;
    }

    try {
      const { data: record, authorization_url } =
        await createMomentMutation.mutateAsync(
          buildCreateMomentPayload(values, deliveryTiming),
        );

      posthog.capture("moment_draft_created", {
        occasion: values.occasion,
        template: values.template,
        delivery_timing: deliveryTiming,
        has_music: !!values.music,
        has_photos: (values.photos?.length ?? 0) > 0,
        photo_count: values.photos?.length ?? 0,
        has_message: !!values.message?.trim(),
        has_recipient_email: !!values.recipient_email?.trim(),
        moment_id: record.id,
      });

      toast.success("Redirecting to secure payment…");
      window.location.assign(authorization_url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not create this moment";
      posthog.capture("moment_creation_failed", {
        error_message: errorMessage,
        occasion: values.occasion,
        delivery_timing: deliveryTiming,
      });
      toast.error(errorMessage);
    }
  });

  const generateMessage = async () => {
    try {
      const generated = await generateMessageMutation.mutateAsync({
        occasion,
        headline,
        sender: sender ?? "",
        recipient: recipient ?? "",
      });
      form.setValue("message", generated);
      posthog.capture("ai_message_generated", { occasion });
      toast.success("Generated love message");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate message",
      );
    }
  };

  const improveMessage = async () => {
    const currentMessage = form.getValues("message");
    if (!currentMessage?.trim()) {
      toast.error("Write a message first, then I can improve it");
      return;
    }

    try {
      const improved = await improveMessageMutation.mutateAsync({
        occasion,
        headline,
        sender: sender ?? "",
        recipient: recipient ?? "",
        message: currentMessage,
      });
      form.setValue("message", improved);
      posthog.capture("ai_message_improved", { occasion });
      toast.success("Message improved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to improve message",
      );
    }
  };

  const goNext = async () => {
    if (step === 1) {
      const valid = await form.trigger(["recipient", "sender_email"]);
      if (!valid) return;
    }
    if (step === 5) {
      const valid = await form.trigger("template");
      if (!valid) return;
    }
    const nextStep = Math.min(step + 1, BUILDER_TOTAL_STEPS);
    posthog.capture("builder_step_advanced", {
      from_step: step,
      to_step: nextStep,
    });
    setStep(nextStep);
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 1));

  const setImmediateDelivery = () => {
    setDeliveryTiming("immediate");
    form.setValue("scheduled_date", "", { shouldValidate: true });
    form.clearErrors("scheduled_date");
  };

  const setScheduledDelivery = () => {
    setDeliveryTiming("scheduled");
    if (!form.getValues("scheduled_date")) {
      form.setValue("scheduled_date", todayDateInputValue(), {
        shouldValidate: true,
      });
    }
  };

  const whatsappLink = buildWhatsappShareUrl(
    recipientPhone ?? "",
    savedMoment?.id ?? "",
  );

  return {
    TEMPLATES,
    form,
    step,
    goNext,
    goBack,
    occasion,
    headline,
    recipient,
    message,
    sender,
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
    musicResults: spotifySearchMutation.data ?? [],
    isSearchingMusic: spotifySearchMutation.isPending,
    musicError:
      spotifySearchMutation.error instanceof Error
        ? spotifySearchMutation.error.message
        : spotifySearchMutation.isError
          ? "Failed to search Spotify tracks"
          : "",
    searchMusic,
    selectTrack,
    handleSave,
    isSavingMoment: createMomentMutation.isPending,
    savedMoment,
    successModalOpen,
    setSuccessModalOpen,
    generateMessage,
    improveMessage,
    isGeneratingMessage: generateMessageMutation.isPending,
    isImprovingMessage: improveMessageMutation.isPending,
    whatsappLink,
    ...scrollFades,
  };
}
