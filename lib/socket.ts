import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/socket");
        if (res.ok) {
          const newSocket = io({ path: "/api/socket/io" });

          newSocket.on("connect", () => {
            setSocket(newSocket);
          });
        } else {
          console.error("Failed to init socket server");
        }
      } catch (err) {
        console.error("Socket fetch error:", err);
      }
    };

    init();

    return () => {
      socket?.disconnect();
    };
  }, []);

  return socket;
}
