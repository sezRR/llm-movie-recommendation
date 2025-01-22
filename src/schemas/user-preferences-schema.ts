import { z } from "@hono/zod-openapi";

export const WatchHistoryItemSchema = z.object({
    title: z.string(),
    imdb_id: z.string(),
    rating: z.number(),
    genre: z.string().optional(),
});

export const UserPreferencesSchema = z.object({
    watchHistory: z.array(WatchHistoryItemSchema),
    preferredGenres: z.array(z.string()).optional(),
    leastLikedGenres: z.array(z.string()).optional(),
});

export const UserPreferencesRootSchema = z.object({
    user_id: z.string(),
    preferences: UserPreferencesSchema,
});