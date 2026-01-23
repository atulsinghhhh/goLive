import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Edit, Video } from "lucide-react";
import { FollowButton } from "@/components/user/follow-button";
import { getUserProfile } from "@/lib/user-service";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    
    // Fetch profile data directly (server-side)
    const profile = await getUserProfile(username);

    if (!profile) {
        return notFound();
    }

    const { user, isOwner, streams, isFollowing, followerCount } = profile;

        return (
            <div className="min-h-screen bg-black text-white">
                {/* Banner Area (Placeholder gradient for now) */}
                <div className="h-64 bg-linear-to-r from-purple-900 to-indigo-900 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-40 h-40 rounded-full border-4 border-black bg-zinc-800 overflow-hidden relative">
                                {user.avatar ? (
                                    <Image 
                                        src={user?.avatar} 
                                        alt={user.username} 
                                        fill 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-zinc-600 bg-zinc-900">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <Link 
                                    href="/profile" 
                                    className="absolute bottom-2 right-2 p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors shadow-lg border border-black"
                                >
                                    <Edit size={16} />
                                </Link>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 pt-20 md:pt-24 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold flex items-center gap-2">
                                        {user.username}
                                        {streams[0]?.isLive && (
                                            <span className="bg-destructive text-xs px-2 py-1 rounded font-bold uppercase animate-pulse">Live</span>
                                        )}
                                    </h1>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                                        {user.bio || "No bio yet."}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{followerCount}</span> followers
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                    {isOwner ? (
                                        <Link 
                                            href="/profile"
                                            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-bold border border-border transition-colors text-foreground"
                                        >
                                            Edit Profile
                                        </Link>
                                    ) : (
                                        <FollowButton 
                                            followingId={user._id.toString()} 
                                            initialIsFollowing={isFollowing} 
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity / Content */}
                            <div className="border-t border-zinc-800 pt-8 mt-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Video size={20} className="text-purple-500" />
                                    Recent Broadcasts
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {streams.length > 0 ? (
                                        streams.map((stream: { _id: string; thumbnailUrl?: string; title: string; isLive?: boolean; createdAt: string; category: string }) => (
                                            <div key={stream._id} className="group cursor-pointer">
                                                <div className="aspect-video bg-zinc-900 rounded-lg mb-3 relative overflow-hidden border border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                                                    {stream.thumbnailUrl ? (
                                                        <Image 
                                                            src={stream.thumbnailUrl} 
                                                            alt={stream.title} 
                                                            fill
                                                            className="object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-700 group-hover:text-zinc-600 transition-colors">
                                                            <Video size={48} />
                                                        </div>
                                                    )}
                                                    {stream.isLive && (
                                                        <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-xs font-bold">LIVE</div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-mono text-zinc-400">
                                                        {new Date(stream.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-zinc-200 group-hover:text-purple-400 transition-colors truncate">{stream.title}</h3>
                                                <p className="text-sm text-zinc-500">{stream.category}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-zinc-600 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                                            <div className="mx-auto w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                                <Video className="opacity-50" />
                                            </div>
                                            <p>No recent streams found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    // No catch needed for standard errors, Next.js Error Boundary catches them.
}

