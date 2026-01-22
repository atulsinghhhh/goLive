import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { StreamParticipant } from "@/model/streamParticipant.model";
import { Stream } from "@/model/stream.model";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { streamId } = await request.json();
        
        if (!streamId) {
            return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
        }

        await dbConnect();

        const existing = await StreamParticipant.findOne({
            streamId,
            userId: session.user.id,
            leftAt: null
        });

        if (existing) {
            return NextResponse.json({ participant: existing });
        }

        const participant = await StreamParticipant.create({
            streamId,
            userId: session.user.id,
            role: "viewer",
            joinedAt: new Date()
        });

        await Stream.findByIdAndUpdate(streamId, { $inc: { peakViewers: 1 } });

        return NextResponse.json({ participant }, { status: 201 });

    } catch (error) {
        console.error("Error joining stream:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { streamId } = await request.json();

        await dbConnect();

        await StreamParticipant.updateMany(
            { streamId, userId: session.user.id, leftAt: null },
            { leftAt: new Date() }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error leaving stream:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
