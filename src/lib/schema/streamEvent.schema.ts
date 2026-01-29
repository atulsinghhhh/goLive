import { z } from 'zod'

// step 1: Event Creation (Streamer Side) 
// Streamer goes to dashboard → "Create PPV Event" 
// Fills out form: Event title: "Exclusive Guitar Masterclass" 
// Description: Full details 
// Price: $19.99 
// Date/Time: Feb 15, 2026 at 8pm EST 
// Max tickets: 500 (optional limit) 
// Replay access: Yes, available for 7 days after event

export const streamEvent =z.object({
    title: z.string().min(4).max(6),
    description: z.string(),
    price: z.number(),
    startTime: z.date(),
    endTime: z.date(),
    maxTickets: z.number(),
    // replayAvailableUntil: z.date(),
})