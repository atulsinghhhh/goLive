import mongoose,{ Document,Schema,model,models } from 'mongoose';

export interface IChat extends Document{
    streamId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    message: string;
    username: string;
    isDeleted: boolean;
    moderationFlag?: "spam" | "toxic" | "hate" | "sexual" | "other";
}

const chatSchema = new Schema({
    streamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    moderationFlag: {
        type: String,
        enum: ["spam", "toxic", "hate", "sexual", "other"],
        default: null
    }
},{timestamps: true});

export const Chat = models.Chat || model<IChat>("Chat",chatSchema);