"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
exports.getMessage = getMessage;
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("openai/helpers/zod");
const config_1 = require("./config");
const zod_2 = require("zod");
const env_1 = require("./config/env");
const pastRecommendations = ["tt0116282", "tt0116281", "tt0116283", "tt5290382", "tt2707408", "tt0286486"];
const modelConfig = (0, config_1.loadConfigYAML)();
const env = (0, env_1.validateEnv)();
const openai = new openai_1.default({
    apiKey: env.OPENAI_API_KEY,
});
function validateMessageInput(message) {
    if (message.length === 0) {
        throw new Error("The message content cannot be empty.");
    }
    if (message.length > modelConfig.model.maxInputTokens) {
        throw new Error("The message content cannot exceed 1024 characters.");
    }
}
const RecommendationSchema = zod_2.z.object({
    title: zod_2.z.string(),
    imdb_id: zod_2.z.string(),
    description: zod_2.z.string(),
    reasoning: zod_2.z.string(),
});
async function getMessage(message) {
    validateMessageInput(message);
    message.excludeIds = pastRecommendations;
    console.log("SERVER > message:", message);
    const completion = await openai.chat.completions.create({
        model: modelConfig.model.name,
        max_tokens: modelConfig.model.maxOutputTokens,
        messages: [
            { role: "system", content: modelConfig.systemInstructions },
            { role: "user", content: JSON.stringify(message) }
        ],
        response_format: (0, zod_1.zodResponseFormat)(RecommendationSchema, "recommendation"),
    });
    console.log("COMPLETION HIT:", completion);
    if (completion.choices[0].message.content === null) {
        throw new Error("Completion content is null.");
    }
    const result = RecommendationSchema.parse(JSON.parse(completion.choices[0].message.content));
    pastRecommendations.push(result.imdb_id);
    console.log("SERVER > past recommendations:", pastRecommendations);
    return result;
}
;
exports.API = { getMessage };
