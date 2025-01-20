declare module "bun" {
    interface Env {
        PORT: string;
        OPENAI_API_KEY: string;
    }
}