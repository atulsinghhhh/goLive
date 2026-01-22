"use client";

import { Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

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

export function HeroCarousel({ stream }: { stream: Stream | null }) {
    const [muted, setMuted] = useState(true);

    if (!stream) {
        return (
            <div className="w-full h-[400px] bg-zinc-900 rounded-xl flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 z-10"></div>
                 <div className="text-center z-20">
                     <h2 className="text-2xl font-bold text-white mb-2">Community is everything</h2>
                     <p className="text-zinc-400">Join the thousands of creators streaming now.</p>
                 </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] bg-zinc-900 rounded-xl overflow-hidden relative group shadow-2xl shadow-purple-900/10">
            <div className="absolute inset-0 bg-zinc-800">
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <Play size={64} fill="currentColor" className="opacity-50" />
                </div>
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent z-10"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full md:w-1/2 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 p-0.5">
                         <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                            {stream.streamerId.avatar ? (
                                <Image src={stream.streamerId.avatar} fill alt={stream.streamerId.username} className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                    {stream.streamerId.username[0].toUpperCase()}
                                </div>
                            )}
                         </div>
                    </div>
                    <div>
                        <h3 className="text-purple-400 font-bold text-sm tracking-wide uppercase">Featured Stream</h3>
                        <Link href={`/stream/${stream.streamerId.username}`} className="text-2xl font-bold text-white hover:underline decoration-purple-500 decoration-2 underline-offset-4">
                            {stream.streamerId.username}
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg text-zinc-200 line-clamp-1 font-medium">{stream.title}</h2>
                    <p className="text-zinc-400 text-sm mt-1 bg-zinc-800/80 px-2 py-1 rounded w-fit">{stream.category}</p>
                </div>

                <div className="flex gap-4 pt-2">
                    <Link 
                        href={`/stream/${stream.streamerId.username}`}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        Watch Now
                    </Link>
                </div>
            </div>

            {/* Tags/Stats */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase animate-pulse">
                    Live
                </div>
                <div className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                    {stream.viewerCount} Viewers
                </div>
            </div>
        </div>
    );
}
