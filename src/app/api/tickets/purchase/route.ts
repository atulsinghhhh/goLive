import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Event } from "@/model/event.model";
import { Ticket } from "@/model/ticket.model";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if already purchased
        const existingTicket = await Ticket.findOne({
            userId: session.user.id,
            eventId: event._id
        });

        if (existingTicket) {
             return NextResponse.json({ error: "Ticket already purchased" }, { status: 400 });
        }

        // Mock Payment Success -> Create Ticket
        const ticket = await Ticket.create({
            userId: session.user.id,
            eventId: event._id,
            status: "active"
        });

        // Send Email via Resend
        if (session.user.email) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev', // Use default for testing or verified domain
                    to: session.user.email,
                    subject: `Ticket Confirmed: ${event.title}`,
                    html: `
                        <h1>Ticket Confirmation</h1>
                        <p>You have successfully purchased a ticket for <strong>${event.title}</strong>.</p>
                        <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
                        <p><strong>Price:</strong> $${event.price}</p>
                        <p>Access your event from the dashboard on the day.</p>
                        <br/>
                        <p>Ticket ID: ${ticket._id}</p>
                    `
                });
                console.log("Email sent successfully to", session.user.email);
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                // Don't fail the request if email fails, but log it
            }
        }

        return NextResponse.json({ ticket }, { status: 201 });

    } catch (error) {
        console.error("Error creating ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
