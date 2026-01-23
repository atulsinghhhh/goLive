
import { auth } from "@/lib/auth";
import { Stream } from "@/model/stream.model";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { thumbnailUrl } = await req.json();
        console.log("thumbnailUrl: ", thumbnailUrl)

        if (!thumbnailUrl) {
            return NextResponse.json({ error: "Missing thumbnail URL" }, { status: 400 });
        }

        await dbConnect();
        const stream = await Stream.findOneAndUpdate(
            { streamerId: session.user.id },
            { thumbnailUrl },
            { new: true, upsert: true } 
        );
        console.log("stream: ", stream)

        return NextResponse.json({ stream }, { status: 200 });

    } catch (error) {
        console.error("Stream Thumbnail Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
