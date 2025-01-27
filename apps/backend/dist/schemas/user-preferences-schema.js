"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesRootSchema = exports.UserPreferencesSchema = exports.WatchHistoryItemSchema = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
exports.WatchHistoryItemSchema = zod_openapi_1.z.object({
    title: zod_openapi_1.z.string(),
    imdb_id: zod_openapi_1.z.string(),
    rating: zod_openapi_1.z.number(),
    genre: zod_openapi_1.z.string().optional(),
});
exports.UserPreferencesSchema = zod_openapi_1.z.object({
    watchHistory: zod_openapi_1.z.array(exports.WatchHistoryItemSchema),
    preferredGenres: zod_openapi_1.z.array(zod_openapi_1.z.string()).optional(),
    leastLikedGenres: zod_openapi_1.z.array(zod_openapi_1.z.string()).optional(),
});
exports.UserPreferencesRootSchema = zod_openapi_1.z.object({
    user_id: zod_openapi_1.z.string(),
    preferences: exports.UserPreferencesSchema,
});
