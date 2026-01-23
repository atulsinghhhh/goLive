import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/model/user.model";
import { Stream } from "@/model/stream.model";
import { Follow } from "@/model/follow.model";

export async function getUserProfile(username: string) {
    if (!username) {
        throw new Error("Username is required");
    }

    await dbConnect();
    const session = await auth();

    // Fetch user
    const user = await User.findOne({ username }).lean();
    if (!user) {
        return null;
    }

    // Check if owner
    const isOwner = session?.user?.email === user.email;

    // Fetch Recent Streams (or current live one)
    const streams = await Stream.find({ streamerId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Check if following
    const isFollowing = session?.user
        ? !!(await Follow.findOne({
            followerId: session.user.id,
            followingId: user._id,
        }))
        : false;

    // Get Follower Count
    const followerCount = await Follow.countDocuments({
        followingId: user._id,
    });

    // Serialize ObjectIds and Dates if necessary, but returning raw objects is usually fine for Server Components 
    // as long as we handle them correctly before passing to Client Components.
    // However, to mimic the API JSON response exactly and avoid serialization issues:
    
    return {
        user: {
            ...user,
            _id: user._id.toString(),
            // Ensure other ObjectIds if any are converted
            createdAt: user.createdAt?.toString(),
            updatedAt: user.updatedAt?.toString(),
        },
        isOwner,
        streams: streams.map(stream => ({
            ...stream,
            _id: stream._id.toString(),
            streamerId: stream.streamerId.toString(),
            createdAt: stream.createdAt?.toISOString(), // API likely returned ISO string
            updatedAt: stream.updatedAt?.toISOString(),
        })),
        isFollowing,
        followerCount,
    };
}
