"use client";

import { useRequireAuth } from "@/lib/auth/protected-route";
import { TimelineFrame } from "@/components/timeline/TimelineFrame";
import { TimelineCard } from "@/components/timeline/TimelineCard";
import { EditMomentDialog } from "@/components/timeline/EditMomentDialog";
import { DeleteMomentDialog } from "@/components/timeline/DeleteMomentDialog";
import { useTimelineDashboard } from "@/hooks/useTimelineDashboard";

export function TimelineDashboard() {
  const { isLoading: isAuthLoading } = useRequireAuth();
  const {
    email,
    moments,
    stats,
    isLoading,
    isError,
    refetch,
    editing,
    setEditing,
    deleting,
    setDeleting,
    isSaving,
    isDeleting,
    handleSignOut,
    handleSaveMoment,
    handleDeleteMoment,
  } = useTimelineDashboard();

  if (isAuthLoading) {
    return (
      <TimelineFrame>
        <div className="timeline-state">
          <div className="timeline-loader" aria-hidden />
          <p>Checking your session…</p>
        </div>
      </TimelineFrame>
    );
  }

  return (
    <TimelineFrame email={email} onSignOut={handleSignOut}>
      <section className="timeline-hero">
        <p className="timeline-eyebrow">Your love story</p>
        <h1 className="timeline-title">Timeline</h1>
        <p className="timeline-subtitle">
          Every moment you&apos;ve sent and received, woven into one beautiful
          thread.
        </p>
        {!isLoading && !isError ? (
          <div className="timeline-stats">
            <span>{stats.sentCount} sent</span>
            <span className="timeline-stats-dot" aria-hidden>
              ♥
            </span>
            <span>{stats.receivedCount} received</span>
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
          <button
            type="button"
            className="timeline-retry"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && moments.length === 0 ? (
        <div className="timeline-empty">
          <p className="timeline-empty-title">No moments yet</p>
          <p className="timeline-empty-copy">
            Create your first love note and it will appear here - sent and
            received moments, all in one place.
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
        isSaving={isSaving}
        onSave={handleSaveMoment}
      />

      <DeleteMomentDialog
        moment={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        isDeleting={isDeleting}
        onConfirm={handleDeleteMoment}
      />
    </TimelineFrame>
  );
}
