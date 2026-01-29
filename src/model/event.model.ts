import { Schema, models, model, Document, Types } from "mongoose";

export interface IEvent extends Document {
    streamerId: Types.ObjectId;
    title: string;
    description: string;
    price: number;
    date: Date;
    isLive: boolean;
    thumbnailUrl?: string;
    agoraChannel: string;
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
    streamerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true
    },
    isLive: {
        type: Boolean,
        default: false
    },
    thumbnailUrl: {
        type: String
    },
    agoraChannel: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

export const Event = models.Event || model<IEvent>("Event", eventSchema);