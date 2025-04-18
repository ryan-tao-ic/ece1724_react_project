import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function createCalendarLink(event: { 
  eventStartTime: Date | string; 
  eventEndTime: Date | string; 
  name: string; 
  location: string 
}) {
  const startDate = typeof event.eventStartTime === 'string' 
    ? new Date(event.eventStartTime) 
    : event.eventStartTime;
    
  const endDate = typeof event.eventEndTime === 'string'
    ? new Date(event.eventEndTime)
    : event.eventEndTime;
  
  const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0];
  const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0];
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&location=${encodeURIComponent(event.location)}`;
}
