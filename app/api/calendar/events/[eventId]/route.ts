import { NextResponse } from 'next/server';
import { createEvents, EventAttributes } from 'ics';
import { prisma } from '@/prisma';

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  const params = await Promise.resolve(context.params);
  const eventId = params.eventId;
  
  if (!eventId) {
    return new Response("Missing eventId", { status: 400 });
  }
  
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  function dateArrayUTC(date: Date): [number, number, number, number, number] {
    return [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
    ];
  }
  

  const icsEvent: EventAttributes = {
    uid: event.id,
    title: event.name,
    description: event.description ?? '',
    location: event.location,
    start: dateArrayUTC(new Date(event.eventStartTime)),
    end: dateArrayUTC(new Date(event.eventEndTime)),
    status: event.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
    organizer: { name: 'EventHub', email: 'noreply@emolee.space' },
    productId: '-//EventHub//Calendar//CN',
    method: 'PUBLISH',
    startInputType: 'utc',  
    endInputType: 'utc', 
  };

  const { error, value } = createEvents([icsEvent]);
  if (error) return new NextResponse('Failed to generate .ics', { status: 500 });

  return new NextResponse(value, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="event.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

function dateArray(date: Date): [number, number, number, number, number] {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}