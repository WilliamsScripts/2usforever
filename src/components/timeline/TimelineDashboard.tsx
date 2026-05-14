"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TimelineFrame } from "@/components/timeline/TimelineFrame";
import { TimelineCard } from "@/components/timeline/TimelineCard";
import { EditMomentDialog } from "@/components/timeline/EditMomentDialog";
import { DeleteMomentDialog } from "@/components/timeline/DeleteMomentDialog";
import {
  useDeleteTimelineMoment,
  useTimeline,
  useUpdateTimelineMoment,
} from "@/hooks/useTimeline";
import { signOut } from "@/services/timeline.service";
import type { TimelineMoment } from "@/types/timeline";

export function TimelineDashboard() {
  const { data, isLoading, isError, refetch } = useTimeline();
  const updateMutation = useUpdateTimelineMoment();
  const deleteMutation = useDeleteTimelineMoment();
  const [editing, setEditing] = useState<TimelineMoment | null>(null);
  const [deleting, setDeleting] = useState<TimelineMoment | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/timeline/login";
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  const moments = data?.data ?? [];
  const sentCount = moments.filter((m) => m.direction === "sent").length;
  const receivedCount = moments.filter((m) => m.direction === "received").length;

  return (
    <TimelineFrame email={data?.email} onSignOut={handleSignOut}>
      <section className="timeline-hero">
        <p className="timeline-eyebrow">Your love story</p>
        <h1 className="timeline-title">Timeline</h1>
        <p className="timeline-subtitle">
          Every moment you&apos;ve sent and received, woven into one beautiful
          thread.
        </p>
        {!isLoading && !isError ? (
          <div className="timeline-stats">
            <span>{sentCount} sent</span>
            <span className="timeline-stats-dot" aria-hidden>
              ♥
            </span>
            <span>{receivedCount} received</span>
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <div className="timeline-state">
          <div className="timeline-loader" aria-hidden />
          <p>Gathering your moments…</p>
        </div>
      ) : null}

      {isError ? (
        <div className="timeline-state">
          <p>We couldn&apos;t load your timeline.</p>
          <button type="button" className="timeline-retry" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && moments.length === 0 ? (
        <div className="timeline-empty">
          <p className="timeline-empty-title">No moments yet</p>
          <p className="timeline-empty-copy">
            Create your first love note and it will appear here — sent and received
            moments, all in one place.
          </p>
          <a href="/create-moment" className="timeline-empty-cta">
            Create a moment
          </a>
        </div>
      ) : null}

      {!isLoading && !isError && moments.length > 0 ? (
        <div className="timeline-feed">
          <div className="timeline-line" aria-hidden />
          {moments.map((moment, index) => (
            <TimelineCard
              key={moment.id}
              moment={moment}
              index={index}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : null}

      <EditMomentDialog
        moment={editing}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        isSaving={updateMutation.isPending}
        onSave={async (payload) => {
          if (!editing) return;
          try {
            await updateMutation.mutateAsync({ id: editing.id, payload });
            toast.success("Moment updated");
            setEditing(null);
          } catch {
            toast.error("Could not update moment");
          }
        }}
      />

      <DeleteMomentDialog
        moment={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        isDeleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMutation.mutateAsync(deleting.id);
            toast.success("Moment deleted");
            setDeleting(null);
          } catch {
            toast.error("Could not delete moment");
          }
        }}
      />
    </TimelineFrame>
  );
}
