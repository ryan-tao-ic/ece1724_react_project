"use client";

import { useSocket } from "@/lib/socket"; // update this path to match where your hook lives
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckinListener({
  qrCode,
  eventId,
}: {
  qrCode: string;
  eventId: string;
}) {
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !qrCode) return;
    console.log("Joining checkin room:", qrCode);
    socket.emit("watch-checkin", qrCode);

    const handleCheckedIn = () => {
      console.log("✅ You have been checked in!");
      socket.emit("leave-room", `checkin-${qrCode}`);
      router.push(`/lounge/${eventId}`);
    };

    socket.on("checked-in", handleCheckedIn);

    return () => {
      socket.off("checked-in", handleCheckedIn);
    };
  }, [socket, qrCode, eventId, router]);

  return null;
}
