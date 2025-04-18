"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoungeAccessButtonProps {
  eventId: string;
  eventLecturerIds: string[];
  eventStatus: string;
}

export function LoungeAccessButton({
  eventId,
  eventLecturerIds,
  eventStatus,
}: LoungeAccessButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const canEnterLounge =
    eventStatus === "PUBLISHED" &&
    (user?.role === "STAFF" || eventLecturerIds.includes(user?.id ?? ""));

  if (!canEnterLounge) return null;

  return (
    <Button
      variant="secondary"
      className="h-10 px-4"
      onClick={() => router.push(`/lounge/${eventId}`)}
    >
      Enter Virtual Lounge
    </Button>
  );
}
