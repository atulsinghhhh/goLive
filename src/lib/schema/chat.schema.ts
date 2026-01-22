import { z } from "zod";

export const chatMessageSchema = z.object({
    streamId: z.string(),
    userId: z.string(),
    username: z.string().min(1),
    message: z.string().min(1).max(300),
    isDeleted: z.boolean().default(false),
}) 