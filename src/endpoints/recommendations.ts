// recommendations.ts
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { validator as zValidator, resolver } from 'hono-openapi/zod';
import { UserPreferencesRootSchema } from '../schemas/user-preferences-schema';
import { z } from '@hono/zod-openapi';

const app = new Hono();

app.post(
    '/',
    describeRoute({
        description: 'Process user preferences and provide recommendations',
        requestBody: {
            content: {
                'application/json': {
                    schema: resolver(UserPreferencesRootSchema),
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Recommendations generated successfully',
                content: {
                    'application/json': {
                        schema: resolver(UserPreferencesRootSchema),
                    },
                },
            },
            400: {
                description: 'Invalid request body',
                content: {
                    'application/json': {
                        schema: resolver(
                            z.object({
                                error: z.string().openapi({ example: 'Invalid request body' }),
                            })
                        ),
                    },
                },
            },
        },
    }),
    zValidator('json', UserPreferencesRootSchema),
    async (c) => {
        try {
            const userPreferences = c.req.valid('json');
            // Process userPreferences and generate recommendations
            return c.json(userPreferences, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Invalid request body' }, 400);
        }
    }
);

export default app;
