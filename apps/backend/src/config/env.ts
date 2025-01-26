import { backendEnvSchema, type BackendEnv } from '@ai-recommender/shared';
import z from 'zod';

declare global {
    namespace NodeJS {
        interface ProcessEnv extends BackendEnv { }
    }
}

export const validateEnv = (): BackendEnv => {
    try {
        return backendEnvSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Invalid environment variables:');
        if (error instanceof z.ZodError) {
            console.error('❌ Missing required environment variables:');
            console.error('Required variables:');
            console.error('- OPENAI_API_KEY');
            console.error('- GOOGLE_ID');
            console.error('- GOOGLE_SECRET');
            console.error('- AUTH_SECRET');
            error.issues.forEach(issue => {
                console.error(`  → ${issue.path.join('.')}: ${issue.message}`);
            });
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

// Utility for Hono context
export const getEnv = (c: any): BackendEnv => {
    return backendEnvSchema.parse({
        ...process.env,
        ...c.env
    });
};