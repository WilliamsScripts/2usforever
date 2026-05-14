"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { TimelineMoment } from "@/types/timeline";
import { cn } from "@/lib/utils";

type TimelineCardProps = {
  moment: TimelineMoment;
  index: number;
  onEdit: (moment: TimelineMoment) => void;
  onDelete: (moment: TimelineMoment) => void;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineCard({
  moment,
  index,
  onEdit,
  onDelete,
}: TimelineCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const isSent = moment.direction === "sent";
  const counterpart = isSent ? moment.recipient : moment.sender;
  const label = isSent ? "You sent" : "You received";

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={cn(
        "timeline-card",
        isSent ? "timeline-card--sent" : "timeline-card--received",
        visible && "timeline-card--visible",
      )}
      style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
    >
      <div className="timeline-card-rail" aria-hidden>
        <span className="timeline-card-heart">
          <Heart className="size-3.5 fill-current" />
        </span>
      </div>

      <div className="timeline-card-body">
        <div className="timeline-card-meta">
          <span className="timeline-card-direction">{label}</span>
          <time dateTime={moment.created_at}>{formatDate(moment.created_at)}</time>
        </div>

        <p className="timeline-card-occasion">{moment.occasion}</p>
        <h3 className="timeline-card-title">
          {moment.headline?.trim() ||
            (isSent
              ? `For ${counterpart ?? "someone special"}`
              : `From ${counterpart ?? "someone who loves you"}`)}
        </h3>

        {moment.message ? (
          <p className="timeline-card-message">
            {moment.message.length > 220
              ? `${moment.message.slice(0, 220)}…`
              : moment.message}
          </p>
        ) : null}

        <div className="timeline-card-actions">
          <Link href={`/for/${moment.id}`} className="timeline-card-link">
            <ExternalLink className="size-3.5" />
            Open moment
          </Link>

          {isSent ? (
            <>
              <button
                type="button"
                className="timeline-card-action"
                onClick={() => onEdit(moment)}
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                className="timeline-card-action timeline-card-action--danger"
                onClick={() => onDelete(moment)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
