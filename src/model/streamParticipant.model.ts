import mongoose,{ Document,Schema,model,models } from 'mongoose';

export interface IStreamParticipant extends Document {
    streamId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    role: "host" | "viewer";
    joinedAt: Date;
    leftAt?: Date;
}

const streamParticipantSchema = new Schema<IStreamParticipant>({
    streamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stream",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["host", "viewer"],
        default: "viewer"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: {
        type: Date
    }
},{timestamps: true});

export const StreamParticipant = models.StreamParticipant || model<IStreamParticipant>("StreamParticipant",streamParticipantSchema);
