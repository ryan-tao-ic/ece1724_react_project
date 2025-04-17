import prisma from "@/lib/db/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(event), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
