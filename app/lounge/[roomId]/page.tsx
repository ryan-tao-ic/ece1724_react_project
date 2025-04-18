"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEventName } from "@/lib/events/fetchEvent";
import { useSocket } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LoungeRoom() {
  const socket = useSocket();
  const { data: session } = useSession();
  const user = session?.user;
  const [messages, setMessages] = useState<
    { sender: string; message: string; timestamp: string }[]
  >([]);
  const [input, setInput] = useState("");
  const params = useParams();
  const roomId = params?.roomId as string | undefined;
  const [eventName, setEventName] = useState<string | null>(null);
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<
    { id: string; name: string; role: string }[]
  >([]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;
    fetchEventName(roomId).then((name) => setEventName(name));
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId || !user?.id || !user?.firstName || !user?.lastName) return;
    console.log("Joining room:", roomId);
    socket.emit("join-room", {
      roomId,
      userId: user?.id,
      fullName: `${user?.firstName} ${user?.lastName}`,
      role: user?.role,
    });

    // Load previous messages
    socket.emit("load-messages", roomId);

    socket.on("previous-messages", (previousMessages) => {
      setMessages(previousMessages); // Replace with historical messages
    });

    socket.on(
      "room-users",
      (users: { id: string; name: string; role: string }[]) => {
        setJoinedUsers(users);
      }
    );

    socket.on(
      "message",
      (data: {
        sender: string;
        message: string;
        timestamp: string;
        senderId: string;
      }) => {
        setMessages((prev) => [...prev, data]);
      }
    );

    return () => {
      socket.off("message");
      socket.off("previous-messages");
    };
  }, [socket, roomId, user?.firstName, user?.lastName, user?.id, user?.role]);

  const sendMessage = () => {
    if (input.trim() && socket && roomId) {
      socket.emit("message", {
        roomId,
        message: input,
        sender: user?.firstName + " " + user?.lastName || "Anonymous",
        timestamp: new Date().toISOString(), // Add this line
        senderId: user?.id,
      });
      setInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Event Virtual Lounge:{" "}
        <span className="text-blue-600">{eventName ?? "Loading..."}</span>
      </h1>

      <div className="flex gap-6 mb-6 h-[60vh]">
        {/* Users in Room */}
        <div className="w-1/3 border rounded-lg shadow-sm p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Users in Room</h2>
          <div className="space-y-3">
            {joinedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {u.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{u.name}</span>
                <span className="text-gray-500 text-xs">({u.role})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
          <CardContent className="p-4 flex-1 overflow-y-auto">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isOwnMessage =
                      msg.sender === `${user?.firstName} ${user?.lastName}`;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`flex items-start gap-3 ${isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.sender
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`text-sm px-3 py-2 rounded-lg max-w-[80%] ${isOwnMessage
                              ? "bg-blue-100 text-right"
                              : "bg-gray-100 text-left"
                            }`}
                        >
                          <div className="font-semibold text-gray-800">
                            {msg.sender}
                          </div>
                          <div className="text-gray-600">{msg.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={endOfMessagesRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>


      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
      <Button
        variant="ghost"
        className="fixed bottom-20 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-full px-4 py-2 shadow-sm border border-gray-200 z-50"
        onClick={() => {
          if (socket && roomId) {
            socket.emit("leave-room", roomId);
          }
          router.push("/events");
        }}
      >
        ← Leave Room
      </Button>
    </div>
  );
}
