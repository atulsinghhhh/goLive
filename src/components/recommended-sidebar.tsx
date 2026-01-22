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
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 pt-16">
            <div className="p-4">
                <h2 className="font-bold text-sm uppercase text-muted-foreground mb-4 flex items-center justify-between">
                    <span>Recommended Channels</span>
                    <Video size={16} />
                </h2>
                
                <div className="space-y-1">
                    {streams.length > 0 ? (
                        streams.map((stream) => (
                            <Link 
                                key={stream._id} 
                                href={`/stream/${stream.streamerId.username}`}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-muted relative shrink-0 border border-border">
                                        {stream.streamerId.avatar ? (
                                             <Image src={stream.streamerId.avatar} fill alt={stream.streamerId.username} className="object-cover rounded-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs font-bold text-muted-foreground">
                                                {stream.streamerId.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="font-bold text-sm text-foreground group-hover:text-primary truncate">
                                            {stream.streamerId.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {stream.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-destructive shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                                    <span className="font-mono">{stream.viewerCount}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-muted-foreground text-xs italic p-2">
                            No channels live.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-border">
               <p className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} FlowLive
               </p>
            </div>
        </aside>
    );
}
