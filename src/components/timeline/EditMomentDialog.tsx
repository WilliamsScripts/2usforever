"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (!moment) return;
    setOccasion(moment.occasion ?? "");
    setHeadline(moment.headline ?? "");
    setRecipient(moment.recipient ?? "");
    setSender(moment.sender ?? "");
    setMessage(moment.message ?? "");
    setScheduledDate(moment.scheduled_date ?? "");
  }, [moment]);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit moment</DialogTitle>
          <DialogDescription>
            Update the details of this moment. Only you can change moments you
            created.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3">
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
              className="timeline-input timeline-textarea"
              rows={5}
              maxLength={2000}
            />
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

          <DialogFooter className="mt-2 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
