"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Copy } from "lucide-react";

interface CalendarSubscriptionProps {
  eventId: string;
  variant?: "outline" | "default";
  className?: string;
  buttonText?: string;
}

export default function CalendarSubscription({
  eventId,
  variant = "outline",
  className = "",
  buttonText = "Add to Calendar"
}: CalendarSubscriptionProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const icsUrl = `${baseUrl}/api/calendar/events/${eventId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(icsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} className={`flex items-center gap-2 ${className}`}>
          <Calendar className="h-4 w-4" />
          <span>{buttonText}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Subscribe to Calendar</h4>
            <p className="text-sm text-muted-foreground">
              Use this link to subscribe to event updates.
            </p>
          </div>

          <div className="grid gap-2">
            <Button onClick={handleCopy} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>{copied ? "Link Copied!" : "Copy Subscription Link"}</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            <p>In Google Calendar: Add calendar → From URL → Paste the link</p>
            <p>This will stay synced with future updates</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
