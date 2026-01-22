import { NextRequest, NextResponse } from "next/server";
import { User } from "@/model/user.model";
import dbConnect from "@/lib/db";
import { userSchema } from "@/lib/schema/user.schema";
import { ZodError } from "zod";


export async function POST(request: NextRequest){
    try {

        await dbConnect();
        const body = await request.json();
        const data = userSchema.parse(body);

        const { email,password,username } = data;
        if(!email || !password || !username) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const user = await User.create({ email,password,username });
        return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
        if(error instanceof ZodError){
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.log("Error occured by server: ",error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
