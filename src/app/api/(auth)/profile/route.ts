import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/model/user.model";


export async function PUT(req: NextRequest){
    try {
        await dbConnect();

        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { username,name,bio,avatar,banner } = await req.json();

        const user = await User.findById(session?.user?.id);
        if(!user){
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.username = username;
        user.name = name;
        user.bio = bio;
        if(avatar) user.avatar = avatar;
        if(banner) user.banner = banner;

        await user.save();

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}