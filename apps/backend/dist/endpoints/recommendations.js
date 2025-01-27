"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// recommendations.ts
const hono_1 = require("hono");
const hono_openapi_1 = require("hono-openapi");
const zod_1 = require("hono-openapi/zod");
const user_preferences_schema_1 = require("../schemas/user-preferences-schema");
const zod_openapi_1 = require("@hono/zod-openapi");
const app = new hono_1.Hono();
app.post('/', (0, hono_openapi_1.describeRoute)({
    description: 'Process user preferences and provide recommendations',
    requestBody: {
        content: {
            'application/json': {
                schema: (0, zod_1.resolver)(user_preferences_schema_1.UserPreferencesRootSchema),
            },
        },
        required: true,
    },
    responses: {
        200: {
            description: 'Recommendations generated successfully',
            content: {
                'application/json': {
                    schema: (0, zod_1.resolver)(user_preferences_schema_1.UserPreferencesRootSchema),
                },
            },
        },
        400: {
            description: 'Invalid request body',
            content: {
                'application/json': {
                    schema: (0, zod_1.resolver)(zod_openapi_1.z.object({
                        error: zod_openapi_1.z.string().openapi({ example: 'Invalid request body' }),
                    })),
                },
            },
        },
    },
}), (0, zod_1.validator)('json', user_preferences_schema_1.UserPreferencesRootSchema), async (c) => {
    try {
        const userPreferences = c.req.valid('json');
        // Process userPreferences and generate recommendations
        return c.json(userPreferences, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Invalid request body' }, 400);
    }
});
exports.default = app;
