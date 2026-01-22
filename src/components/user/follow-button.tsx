
"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, UserMinus } from "lucide-react";
import { motion } from "framer-motion";

interface FollowButtonProps {
    followingId: string;
    initialIsFollowing: boolean;
}

export function FollowButton({ followingId, initialIsFollowing }: FollowButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    const handleFollow = () => {
        if (!session) {
            router.push("/login");
            return;
        }

        startTransition(async () => {
            try {
                const endpoint = "/api/follow";
                const method = isFollowing ? "DELETE" : "POST";

                const res = await fetch(endpoint, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ followingId })
                });

                if (res.ok) {
                    setIsFollowing(!isFollowing);
                    router.refresh();
                } else {
                    const data = await res.json();
                    alert(data.error || "Something went wrong");
                }
            } catch (error) {
                console.error(error);
                alert("Failed to update follow status");
            }
        });
    };
    
    // Prevent following self
    if (session?.user?.id === followingId) {
        return null;
    }

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            disabled={isPending}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
                isFollowing 
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
            }`}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="w-4 h-4" /> Unfollow
                </>
            ) : (
                <>
                    <Heart className="w-4 h-4" /> Follow
                </>
            )}
        </motion.button>
    );
}
