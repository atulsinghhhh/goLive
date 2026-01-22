import { z } from "zod";

export const userSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[A-Z0-9_a-z]+$/, "Username must be uppercase"),
    email: z.string().email(),
    password: z.string().min(6).max(20)
});

