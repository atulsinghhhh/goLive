import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/model/user.model";
import { Stream } from "@/model/stream.model";
import { Follow } from "@/model/follow.model";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const session = await auth();

        // Fetch user
        const user = await User.findOne({ username }).lean();
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
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

        return NextResponse.json({
            user,
            isOwner,
            streams,
            isFollowing,
            followerCount,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
