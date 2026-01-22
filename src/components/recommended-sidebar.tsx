"use client";

import { User, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Stream {
    _id: string;
    title: string;
    category: string;
    viewerCount: number;
    streamerId: {
        username: string;
        avatar?: string;
    };
}

export function RecommendedSidebar({ streams }: { streams: Stream[] }) {
    return (
        <aside className="hidden lg:flex flex-col w-64 bg-black border-r border-zinc-900 h-screen sticky top-0 pt-16">
            <div className="p-4">
                <h2 className="font-bold text-sm uppercase text-zinc-400 mb-4 flex items-center justify-between">
                    <span>Recommended Channels</span>
                    <Video size={16} />
                </h2>
                
                <div className="space-y-1">
                    {streams.length > 0 ? (
                        streams.map((stream) => (
                            <Link 
                                key={stream._id} 
                                href={`/stream/${stream.streamerId.username}`}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 relative shrink-0">
                                        {stream.streamerId.avatar ? (
                                             <Image src={stream.streamerId.avatar} fill alt={stream.streamerId.username} className="object-cover rounded-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs font-bold text-zinc-500">
                                                {stream.streamerId.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="font-bold text-sm text-zinc-300 group-hover:text-purple-400 truncate">
                                            {stream.streamerId.username}
                                        </span>
                                        <span className="text-xs text-zinc-500 truncate">
                                            {stream.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-red-500 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="font-mono">{stream.viewerCount}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-zinc-600 text-xs italic p-2">
                            No channels live.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-zinc-900">
               <p className="text-xs text-zinc-600">
                  &copy; {new Date().getFullYear()} FlowLive
               </p>
            </div>
        </aside>
    );
}
