import { z } from "zod";

export const chatMessageSchema = z.object({
    streamId: z.string(),
    message: z.string().min(1).max(300),
});