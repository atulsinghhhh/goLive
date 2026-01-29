import { Schema, models, model, Document, Types } from "mongoose";

export interface ITicket extends Document {
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    purchasedAt: Date;
    status: "active" | "expired";
}

const ticketSchema = new Schema<ITicket>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    }
}, { timestamps: true });

// Ensure a user can only buy one ticket per event
ticketSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Ticket = models.Ticket || model<ITicket>("Ticket", ticketSchema);
