
import { auth } from "@/lib/auth";
import { Follow } from "@/model/follow.model";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { followingId } = await req.json();

        if (!followingId) {
            return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
        }

        if (followingId === session.user.id) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        await dbConnect();

        // Check if already following
        const existingFollow = await Follow.findOne({
            followerId: session.user.id,
            followingId
        });

        if (existingFollow) {
            return NextResponse.json({ error: "Already following" }, { status: 400 });
        }

        // Create follow
        const follow = await Follow.create({
            followerId: session.user.id,
            followingId
        });

        return NextResponse.json({ follow }, { status: 200 });

    } catch (error) {
        console.error("Follow API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { followingId } = await req.json();

        if (!followingId) {
            return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
        }

        await dbConnect();

        const deletedFollow = await Follow.findOneAndDelete({
            followerId: session.user.id,
            followingId
        });

        if (!deletedFollow) {
            return NextResponse.json({ error: "Not following" }, { status: 400 });
        }

        return NextResponse.json({ message: "Unfollowed" }, { status: 200 });

    } catch (error) {
        console.error("Unfollow API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    
    try {
        const url = new URL(req.url);
        const followingId = url.searchParams.get("followingId");
        const countForUser = url.searchParams.get("countForUser");

        await dbConnect();
        
        // 1. Check if logged in user is following specific person
        if (followingId) {
            const session = await auth();
            if (!session?.user) return NextResponse.json({ isFollowing: false });

            const follow = await Follow.findOne({
                followerId: session.user.id,
                followingId
            });

            return NextResponse.json({ isFollowing: !!follow });
        }

        // 2. Get follower count for a user
        if (countForUser) {
            const count = await Follow.countDocuments({ followingId: countForUser });
            return NextResponse.json({ count });
        }

        return NextResponse.json({ error: "Invalid query" }, { status: 400 });
        
    } catch (error) {
        console.error("Follow GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
