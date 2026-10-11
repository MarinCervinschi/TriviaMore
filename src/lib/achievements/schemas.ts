import { z } from "zod";

/** At most three, the room the hero has. */
export const pinAchievementsSchema = z.object({
	keys: z.array(z.string().min(1).max(200)).max(3),
});

export type PinAchievementsInput = z.infer<typeof pinAchievementsSchema>;
