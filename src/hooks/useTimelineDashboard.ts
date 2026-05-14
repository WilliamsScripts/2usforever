"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthProvider";
import { useSignOut } from "@/hooks/useAuth";
import {
  useDeleteTimelineMoment,
  useTimeline,
  useUpdateTimelineMoment,
} from "@/hooks/useTimeline";
import type { TimelineMoment, UpdateTimelineMomentPayload } from "@/types/timeline";

export function useTimelineDashboard() {
  const { user, signOutLocal } = useAuthContext();
  const timelineQuery = useTimeline();
  const updateMutation = useUpdateTimelineMoment();
  const deleteMutation = useDeleteTimelineMoment();
  const signOutMutation = useSignOut();

  const [editing, setEditing] = useState<TimelineMoment | null>(null);
  const [deleting, setDeleting] = useState<TimelineMoment | null>(null);

  const moments = timelineQuery.data?.data ?? [];

  const stats = useMemo(() => {
    const sentCount = moments.filter((moment) => moment.direction === "sent").length;
    const receivedCount = moments.filter(
      (moment) => moment.direction === "received",
    ).length;

    return { sentCount, receivedCount };
  }, [moments]);

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      signOutLocal();
      window.location.href = "/timeline/login";
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  const handleSaveMoment = async (payload: UpdateTimelineMomentPayload) => {
    if (!editing) return;

    try {
      await updateMutation.mutateAsync({ id: editing.id, payload });
      toast.success("Moment updated");
      setEditing(null);
    } catch {
      toast.error("Could not update moment");
    }
  };

  const handleDeleteMoment = async () => {
    if (!deleting) return;

    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("Moment deleted");
      setDeleting(null);
    } catch {
      toast.error("Could not delete moment");
    }
  };

  return {
    email: user?.email ?? timelineQuery.data?.email,
    moments,
    stats,
    isLoading: timelineQuery.isLoading,
    isError: timelineQuery.isError,
    refetch: timelineQuery.refetch,
    editing,
    setEditing,
    deleting,
    setDeleting,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    handleSignOut,
    handleSaveMoment,
    handleDeleteMoment,
  };
}
