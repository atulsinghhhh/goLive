import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Event } from "@/model/event.model";
import { Ticket } from "@/model/ticket.model";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await auth();
        const { id } = await params;

        const event = await Event.findById(id).populate("streamerId", "username avatar bio");

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        let hasTicket = false;
        if (session?.user?.id) {
            const ticket = await Ticket.findOne({
                userId: session.user.id,
                eventId: event._id,
                status: "active"
            });
            hasTicket = !!ticket;
        }

        return NextResponse.json({ 
            event,
            hasTicket
        });

    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (event.streamerId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete tickets associated with event
        await Ticket.deleteMany({ eventId: id });
        
        // Delete event
        await Event.findByIdAndDelete(id);

        return NextResponse.json({ message: "Event deleted" });

    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
