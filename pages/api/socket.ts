import { prisma } from "@/prisma";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
export const config = {
  api: {
    bodyParser: false,
  },
};
const roomUsers: Record<
  string,
  Map<string, { name: string; role: string }>
> = {};

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("✅ Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket/io",
    });

    io.on("connection", (socket) => {
      console.log("New user connected:", socket.id);

      socket.on("watch-checkin", (qrCode) => {
        const room = `checkin-${qrCode}`;
        socket.join(room);
        console.log(`User ${socket.id} is watching check-in for: ${room}`);
      });

      socket.on("checkin", (qrCode) => {
        const room = `checkin-${qrCode}`;
        console.log(`✅ Check-in received for: ${room}`);
        io.to(room).emit("checked-in");
      });

      socket.on("leave-room", (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);
      });

      socket.on("join-room", ({ roomId, userId, fullName, role }) => {
        socket.join(roomId);
        console.log(
          `User ${fullName} (${userId}, ${role}) joined room ${roomId}`
        );

        if (!roomUsers[roomId]) {
          roomUsers[roomId] = new Map();
        }

        // Save user data by ID
        roomUsers[roomId].set(userId, { name: fullName, role });

        // Broadcast updated user list
        const usersInRoom = Array.from(roomUsers[roomId].entries()).map(
          ([id, { name, role }]) => ({ id, name, role })
        );
        io.to(roomId).emit("room-users", usersInRoom);
      });

      socket.on("load-messages", async (roomId) => {
        try {
          const messages = await prisma.qAMessages.findMany({
            where: { eventId: roomId },
            orderBy: { timestamp: "asc" },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          });

          const formattedMessages = messages.map((m) => ({
            sender: m.user?.firstName + " " + m.user?.lastName || "Anonymous",
            message: m.content,
            timestamp: m.timestamp,
            senderId: m.userId,
          }));

          socket.emit("previous-messages", formattedMessages);
        } catch (err) {
          console.error("❌ Failed to load messages:", err);
        }
      });

      socket.on(
        "message",
        async ({ roomId, message, sender, timestamp, senderId }) => {
          console.log(
            `[${timestamp}] Message from ${sender} in room ${roomId}: ${message}`
          );

          // Emit message to clients in the room
          io.to(roomId).emit("message", { sender, message, timestamp });
          console.log("senderId", senderId);
          // Store in Prisma's QAMessages table
          try {
            await prisma.qAMessages.create({
              data: {
                eventId: roomId,
                userId: senderId,
                content: message,
                timestamp: new Date(timestamp), // Optional: will use @default(now()) if not supplied
              },
            });
            console.log("💾 Message saved to DB");
          } catch (err) {
            console.error("❌ Error saving message to DB:", err);
          }
        }
      );

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("⚠️ Socket.IO already initialized");
  }

  res.end();
}
