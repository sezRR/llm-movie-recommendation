declare module "bun" {
    interface Env {
        PORT: string;
        OPENAI_API_KEY: string;
        GOOGLE_ID: string;
        GOOGLE_SECRET: string;
        GOOGLE_REDIRECT: string;
        AUTH_SECRET: string;
    }
}