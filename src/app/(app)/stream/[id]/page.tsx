"use client";

import { AgoraProvider } from "@/context/agora-provider";
import { StreamPlayer } from "@/components/stream-player";
import { StreamChat } from "@/components/stream-chat";
import { StreamBroadcaster } from "@/components/stream-broadcaster";
import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function StreamPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const channelName = resolvedParams.id;
    const { data: session } = useSession();
    
    // Stream Info State
    const [streamInfo, setStreamInfo] = useState<{ _id: string; streamerId: string | { _id: string; username: string }; title: string; category: string; viewerCount: number } | null>(null);
    const [liveChannels, setLiveChannels] = useState<Array<{ agoraChannel: string; _id: string; streamerId: { username: string }; category: string; viewerCount: number }>>([]);
    
    const isStreamer = session?.user?.id && streamInfo?.streamerId && (
        (typeof streamInfo.streamerId === 'string' && session.user.id === streamInfo.streamerId) ||
        (typeof streamInfo.streamerId === 'object' && session.user.id === streamInfo.streamerId._id)
    );

    // Socket for Viewer Redirect
    useEffect(() => {
        if (!streamInfo?._id || !session?.user?.id) return;

        let socket: { on: (event: string, callback: (data: unknown) => void) => void; emit: (event: string, data: unknown) => void; disconnect: () => void };

        const initSocket = async () => {
            const { io } = await import("socket.io-client");
            socket = io("http://localhost:3001", {
                auth: { userId: session?.user?.id }
            });

            socket.on("connect", () => {
                socket.emit("join:stream", { streamId: streamInfo._id });
            });

            socket.on("stream:ended", () => {
                window.location.href = "/"; // Force full reload/redirect to home
            });
        };

        initSocket();

        return () => {
            if (socket) socket.disconnect();
        }
    }, [streamInfo?._id, session?.user?.id]);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const resp = await fetch(`/api/stream?channelName=${channelName}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.stream) {
                        setStreamInfo(data.stream);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        const fetchChannels = async () => {
            try {
                const resp = await fetch("/api/stream");
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.streams) {
                        setLiveChannels(data.streams);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        fetchInfo();
        fetchChannels();
        const interval = setInterval(() => {
            fetchInfo();
            fetchChannels();
        }, 10000); 
        return () => clearInterval(interval);
    }, [channelName]);

    return (
        <AgoraProvider>
            <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar (Hidden for Streamer to keep focus, or maybe keep it? Detailed prompt says "Page Purpose... Display live video as primary focus". Let's hide sidebar for Streamer to give a "Studio" feel) */}
            {!isStreamer && (
                <div className="w-64 border-r border-zinc-800 bg-zinc-950 hidden xl:flex flex-col shrink-0">
                    <div className="p-4">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Recommended Channels</h2>
                        <div className="space-y-2">
                            {liveChannels.length === 0 ? (
                                <p className="text-xs text-zinc-600 italic">No other live channels.</p>
                            ) : (
                                liveChannels.map((stream: { agoraChannel: string; _id: string; streamerId: { username: string }; category: string; viewerCount: number }) => (
                                    <a href={`/stream/${stream.agoraChannel}`} key={stream._id} className={`flex items-center gap-3 p-2 rounded hover:bg-zinc-900 transition-colors ${stream.agoraChannel === channelName ? 'bg-zinc-900' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                                            {stream.streamerId.username[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate text-zinc-300">{stream.streamerId.username}</div>
                                            <div className="text-xs text-zinc-500 truncate">{stream.category}</div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-red-500">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            {stream.viewerCount}
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative">
                        <div className={`max-w-[1600px] mx-auto ${isStreamer ? 'h-full flex flex-col justify-center' : ''}`}>
                            {/* Video Player Container */}
                            <div className="w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden shadow-2xl mb-6 relative group border border-zinc-800">
                                {isStreamer ? (
                                    <StreamBroadcaster channelName={channelName} />
                                ) : (
                                    <StreamPlayer channelName={channelName} />
                                )}
                            </div>

                            {/* Stream Metadata Info (Only show for viewer, or simplified for streamer) */}
                            {!isStreamer && (
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0 border-2 border-zinc-900">
                                            {channelName[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-white leading-tight">
                                                {streamInfo?.title || `Stream by ${channelName}`}
                                            </h1>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-purple-400 font-medium hover:underline cursor-pointer">
                                                    {channelName}
                                                </p>
                                                <span className="text-zinc-600">•</span>
                                                <p className="text-purple-300/80 text-sm bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                    {streamInfo?.category || "Live"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 items-center">
                                        <div className="text-right">
                                            <div className="text-red-500 font-bold flex items-center justify-end gap-2 text-lg">
                                                <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                                {streamInfo?.viewerCount || 0}
                                            </div>
                                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Viewers</p>
                                        </div>
                                        <div className="w-px h-10 bg-zinc-800 mx-2"></div>
                                        <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                                            <span className="sr-only">Share</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar (Chat) */}
                    {streamInfo?._id && streamInfo?.streamerId ? (
                        <div className="h-full border-l border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
                            <StreamChat 
                                streamId={streamInfo._id} 
                                streamerId={typeof streamInfo.streamerId === 'object' ? streamInfo.streamerId._id : streamInfo.streamerId} 
                            />
                        </div>
                    ) : (
                        <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex items-center justify-center">
                            <p className="text-zinc-600 animate-pulse">Connecting to Chat...</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </AgoraProvider>
    );
}
