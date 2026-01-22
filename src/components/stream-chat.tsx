"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  message: string;
  userId: {
    username: string;
    image: string;
  };
  createdAt: string;
}

interface StreamChatProps {
  streamId: string;
  streamerId: string;
}

export const StreamChat = ({ streamId, streamerId }: StreamChatProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStreamer = session?.user?.id === streamerId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!session?.user?.id || !streamId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat?streamId=${streamId}`);
            const data = await res.json();
            if (data.chats) {
                setMessages(data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };
    fetchMessages();

    // Connect to separate socket server port
    const socketInstance = io("http://localhost:3001", {
      auth: {
        userId: session.user.id
      }
    });

    socketInstance.on("connect", () => {
      console.log("Connected to chat server");
      setIsConnected(true);
      socketInstance.emit("join:stream", { streamId });
    });

    socketInstance.on("chat:new", (message: Message) => {
      setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
      });
    });

    socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id, streamId]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    socket.emit("chat:send", {
      streamId,
      message: newMessage
    });

    setNewMessage("");
  };

  const handleBlockUser = (userIdToBlock: string) => {
      if (!socket || !isStreamer) return;
      socket.emit("user:block", { streamId, userIdToBlock });
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-80 shrink-0">
      <div className="h-12 border-b border-border flex items-center justify-center shrink-0">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stream Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 text-center opacity-50">
            <div className="text-4xl">💬</div>
            <p className="text-sm">Welcome to the chat room!</p>
          </div>
        ) : (
            <div className="flex flex-col gap-2">
                {messages.map((msg, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        key={msg.id} 
                        className="flex gap-2 group relative p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden mt-1">
                            {msg.userId.image ? (
                                <img src={msg.userId.image} alt={msg.userId.username} className="w-full h-full object-cover" />
                            ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-primary text-xs font-bold text-primary-foreground uppercase">
                                    {msg.userId.username[0]}
                                 </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm text-foreground">{msg.userId.username}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-foreground/90 break-words leading-relaxed">{msg.message}</p>
                        </div>
                        
                        {isStreamer && msg.userId.username !== session?.user?.username && (
                            <button 
                                onClick={() => handleBlockUser(msg.userId.username)}
                                className="absolute right-2 top-2 p-1 bg-destructive/10 text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                                title="Block User"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card shrink-0">
        <form onSubmit={sendMessage} className="relative">
            <input
                disabled={!isConnected}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isConnected ? "Send a message..." : "Connecting..."}
                className="w-full bg-muted text-foreground p-3 rounded-lg border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm placeholder:text-muted-foreground pr-12"
            />
            <button 
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="absolute right-2 top-2 p-1 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        </form>
      </div>
    </div>
  );
};
