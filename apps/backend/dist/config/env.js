"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = exports.validateEnv = void 0;
const shared_1 = require("@ai-recommender/shared");
const zod_1 = __importDefault(require("zod"));
const validateEnv = () => {
    try {
        return shared_1.backendEnvSchema.parse(process.env);
    }
    catch (error) {
        console.error('❌ Invalid environment variables:');
        if (error instanceof zod_1.default.ZodError) {
            console.error('❌ Missing required environment variables:');
            console.error('Required variables:');
            console.error('- OPENAI_API_KEY');
            console.error('- GOOGLE_ID');
            console.error('- GOOGLE_SECRET');
            console.error('- AUTH_SECRET');
            error.issues.forEach(issue => {
                console.error(`  → ${issue.path.join('.')}: ${issue.message}`);
            });
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
};
exports.validateEnv = validateEnv;
// Utility for Hono context
const getEnv = (c) => {
    return shared_1.backendEnvSchema.parse({
        ...process.env,
        ...c.env
    });
};
exports.getEnv = getEnv;
