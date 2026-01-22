
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Stream } from "@/model/stream.model";
import { StreamParticipant } from "@/model/streamParticipant.model";
import { Chat } from "@/model/chat.model";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        await dbConnect();

        // 1. Total Streams
        const totalStreams = await Stream.countDocuments({ streamerId: userId });

        // 2. Average Viewers (based on peakViewers of user's streams)
        // Calculating true average from Participants is heavy, so let's use peakViewers avg for now or participants count
        // Let's do a simple aggregation on StreamParticipant where role="viewer" and stream belongs to user
        // Actually, easiest valid metric is avg of peakViewers stored in Stream model
        const streams = await Stream.find({ streamerId: userId }).select('peakViewers updatedAt createdAt');
        const avgViewers = streams.length > 0 
            ? Math.round(streams.reduce((acc, s) => acc + (s.peakViewers || 0), 0) / streams.length) 
            : 0;

        // 3. Total Watch Time (Approximate)
        // In a real app, we'd sum (leftAt - joinedAt) for all participants
        // For now, let's substitute with "Total Stream Duration"
        const totalDurationMs = streams.reduce((acc, s) => {
            // If stream is live, use Now - CreatedAt. If ended, use UpdatedAt - CreatedAt (rough approx)
            const end = new Date(s.updatedAt).getTime();
            const start = new Date(s.createdAt).getTime();
            return acc + (end - start);
        }, 0);
        
        // Convert to hours roughly
        const totalHours = Math.round(totalDurationMs / (1000 * 60 * 60));


        // 4. Chat Activity
        // Count chats in streams where streamerId is user
        // We need streamIds first
        const streamIds = streams.map(s => s._id);
        const chatCount = await Chat.countDocuments({ streamId: { $in: streamIds } });

        return NextResponse.json({
            stats: {
                totalStreams,
                avgViewers,
                totalHours: totalHours < 1 ? "< 1" : totalHours,
                chatCount
            }
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
