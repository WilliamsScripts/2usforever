"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGenerateMessage, useImproveMessage } from "@/hooks/useGeminiMessage";
import { OCCASIONS } from "@/types/moment";
import type { TimelineMoment } from "@/types/timeline";
import type { UpdateTimelineMomentPayload } from "@/types/timeline";

type EditMomentDialogProps = {
  moment: TimelineMoment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (payload: UpdateTimelineMomentPayload) => Promise<void>;
};

export function EditMomentDialog({
  moment,
  open,
  onOpenChange,
  isSaving,
  onSave,
}: EditMomentDialogProps) {
  const [occasion, setOccasion] = useState("");
  const [headline, setHeadline] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const generateMessageMutation = useGenerateMessage();
  const improveMessageMutation = useImproveMessage();
  const isGeneratingMessage = generateMessageMutation.isPending;
  const isImprovingMessage = improveMessageMutation.isPending;
  const isAiBusy = isGeneratingMessage || isImprovingMessage;

  useEffect(() => {
    if (!moment) return;
    setOccasion(moment.occasion ?? "");
    setHeadline(moment.headline ?? "");
    setRecipient(moment.recipient ?? "");
    setSender(moment.sender ?? "");
    setMessage(moment.message ?? "");
    setScheduledDate(moment.scheduled_date ?? "");
  }, [moment]);

  const generateMessage = async () => {
    try {
      const generated = await generateMessageMutation.mutateAsync({
        occasion,
        headline: headline.trim() || undefined,
        sender: sender.trim() || undefined,
        recipient,
      });
      setMessage(generated);
      toast.success("Generated love message");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate message",
      );
    }
  };

  const improveMessage = async () => {
    if (!message.trim()) {
      toast.error("Write a message first, then I can improve it");
      return;
    }

    try {
      const improved = await improveMessageMutation.mutateAsync({
        occasion,
        headline: headline.trim() || undefined,
        sender: sender.trim() || undefined,
        recipient,
        message,
      });
      setMessage(improved);
      toast.success("Message improved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to improve message",
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave({
      occasion,
      headline: headline.trim() || null,
      recipient,
      sender: sender.trim() || null,
      message: message.trim() || null,
      scheduled_date: scheduledDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[max(1rem,4dvh)] flex max-h-[min(92dvh,100dvh-1rem)] w-[calc(100vw-1.5rem)] max-w-md translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-1/2 sm:w-full sm:-translate-y-1/2">
        <DialogHeader className="shrink-0 space-y-1 px-4 pt-4 pb-2">
          <DialogTitle>Edit moment</DialogTitle>
          <DialogDescription>
            Update the details of this moment. Only you can change moments you
            created.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto overscroll-contain px-4 py-1">
          <label className="timeline-field">
            <span>Occasion</span>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="timeline-input"
              required
            >
              {OCCASIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="timeline-field">
            <span>Headline</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="timeline-input"
              maxLength={120}
            />
          </label>

          <label className="timeline-field">
            <span>Recipient name</span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="timeline-input"
              required
            />
          </label>

          <label className="timeline-field">
            <span>Your name</span>
            <input
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="timeline-input"
            />
          </label>

          <label className="timeline-field">
            <span>Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="timeline-input timeline-textarea min-h-[88px] max-h-40 resize-y"
              rows={4}
              maxLength={2000}
              disabled={isAiBusy}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={generateMessage}
                disabled={isAiBusy}
                className="flex cursor-pointer items-center gap-1 rounded-full border-[0.5px] border-[#C8516A] bg-[#C8516A]/5 px-3 py-1 text-[13px] font-medium tracking-tight text-[#C8516A] disabled:opacity-50"
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
                disabled={isAiBusy}
                className="flex cursor-pointer items-center gap-1 rounded-full border-[0.5px] border-[#7A1A2A] bg-[#7A1A2A]/5 px-3 py-1 text-[13px] font-medium tracking-tight text-[#7A1A2A] disabled:opacity-50"
              >
                {isImprovingMessage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                Improve message
              </button>
            </div>
          </label>

          <label className="timeline-field">
            <span>Scheduled date (optional)</span>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="timeline-input"
            />
          </label>
          </div>

          <DialogFooter className="mt-0 shrink-0 gap-2 rounded-none border-t bg-muted/50 px-4 py-3 sm:justify-end mx-0 mb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isAiBusy}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
