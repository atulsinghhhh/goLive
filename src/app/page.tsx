"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StreamCard } from "@/components/stream-card";
import { RecommendedSidebar } from "@/components/recommended-sidebar";
import { HeroCarousel } from "@/components/hero-carousel";
import { Loader2, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface StreamType {
    _id: string;
    title: string;
    category: string;
    agoraChannel: string;
    viewerCount: number;
    streamerId: {
        username: string;
        avatar?: string;
    };
}

export default function HomePage() {
    const { data: session, status } = useSession();
    const [streams, setStreams] = useState<StreamType[]>([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        if (status === 'authenticated') {
            console.log("Session Username:", session?.user?.email);
        } else if (status === 'loading') {
            console.log("Session Loading...");
        } else {
            console.log("Session Unauthenticated");
        }
    }, [session, status]);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const resp = await fetch("/api/stream", { cache: 'no-store' });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.streams) {
                        setStreams(data.streams);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        // console.log("username: ", session?.user?.username)
        fetchStreams();
        const interval = setInterval(fetchStreams, 10000); 
        return () => clearInterval(interval);
    }, []);

    const featuredStream = streams.length > 0 ? streams[0] : null;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <RecommendedSidebar streams={streams} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <nav className="h-16 border-b border-border flex items-center px-6 justify-between bg-background sticky top-0 z-50">
                    <Link href="/" className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        FlowLive
                    </Link>
                    <div className="flex gap-4 items-center">
                        <div className="hidden md:block relative w-64 lg:w-80">
                                <form action="/search">
                                    <input 
                                    name="q"
                                    type="text" 
                                    placeholder="Search..." 
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                                    />
                                </form>
                            </div>
                        </div>
                    <div className="flex gap-3 items-center">
                        {session ? (
                            <>
                                <Link href="/dashboard" className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <LayoutDashboard size={16} />
                                    <span>Dashboard</span>
                                </Link>
                                <button 
                                    onClick={() => signOut()}
                                    className="px-4 py-2 text-sm font-bold bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    <span>Log Out</span>
                                </button>
                                <Link href={`/u/${session.user?.username}`} className="w-8 h-8 rounded-full bg-primary overflow-hidden border border-border relative">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="User" width={32} height={32} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full font-bold text-white text-xs">
                                            {session.user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide">
                    <div className="mb-10">
                        <HeroCarousel stream={featuredStream} />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-purple-500">Live</span> Channels
                        </h2>
                        <div className="flex gap-2">
                             <button className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors">Categories</button>
                             <button className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors">Live Channels</button>
                        </div>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-video bg-zinc-900 rounded-xl mb-3"></div>
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
                                            <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && streams.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Loader2 className="animate-spin opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-300 mb-2">No channels live right now</h3>
                            <p className="text-zinc-500 mb-6 max-w-sm">Be the first to start streaming and build your community!</p>
                            <Link href="/dashboard" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors">
                                Start Auto Streaming
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {streams.map(stream => (
                            <StreamCard key={stream._id} stream={stream} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
