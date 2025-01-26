// shared/src/config/env.ts
import { z } from 'zod';

export const envSchema = z.object({

});

export const backendEnvSchema = envSchema.extend({
    PORT: z.string().nonempty(),
    OPENAI_API_KEY: z.string().nonempty(),
    GOOGLE_ID: z.string().nonempty(),
    GOOGLE_SECRET: z.string().nonempty(),
    GOOGLE_REDIRECT: z.string().nonempty(),
    AUTH_SECRET: z.string().nonempty(),
    AUTH_TRUST_HOST: z.string().default("true"),
    JWT_EXPIRATION: z.string().default('1h'),
});

export const frontendEnvSchema = envSchema.extend({
    VITE_PORT: z.string().nonempty(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
export type FrontendEnv = z.infer<typeof frontendEnvSchema>;