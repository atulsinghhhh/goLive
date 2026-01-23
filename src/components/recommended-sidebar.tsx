"use client";

import { Video } from "lucide-react";
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
        <aside className="hidden lg:flex flex-col w-64 bg-card/50 backdrop-blur-md border-r border-border/50 h-screen sticky top-0 pt-16 z-40 transition-all duration-300">
            <div className="p-5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <h2 className="font-bold text-xs uppercase text-muted-foreground mb-4 flex items-center justify-between tracking-wider">
                    <span>Recommended Channels</span>
                    <Video size={14} className="text-primary" />
                </h2>
                
                <div className="space-y-2">
                    {streams.length > 0 ? (
                        streams.map((stream) => (
                            <Link 
                                key={stream._id} 
                                href={`/stream/${stream.streamerId.username}`}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-full bg-muted relative shrink-0 border border-border/50 group-hover:border-primary/50 transition-colors shadow-sm">
                                        {stream.streamerId.avatar ? (
                                             <Image src={stream.streamerId.avatar} fill alt={stream.streamerId.username} className="object-cover rounded-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs font-bold text-muted-foreground/80">
                                                {stream.streamerId.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">
                                            {stream.streamerId.username}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60 truncate">
                                            {stream.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-destructive shrink-0 bg-destructive/10 px-1.5 py-0.5 rounded-md">
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
                                    <span className="font-bold relative top-[0.5px]">{stream.viewerCount}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-muted-foreground text-xs italic p-4 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                            No channels live.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-6 border-t border-border/50 bg-card/30">
               <p className="text-[10px] font-medium text-muted-foreground/50 text-center uppercase tracking-widest">
                  &copy; {new Date().getFullYear()} goLive
               </p>
            </div>
        </aside>
    );
}
