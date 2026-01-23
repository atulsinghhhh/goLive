
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the timestamp
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Generate the signature
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: "twitch-clone", 
        }, process.env.CLOUDINARY_API_SECRET!);

        return NextResponse.json({ 
            signature, 
            timestamp, 
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });

    } catch (error) {
        console.error("Signature generation failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
