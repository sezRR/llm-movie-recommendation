import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { loadConfigYAML } from "./config";
import { z } from "zod";

const pastRecommendations: Array<string> = ["tt0116282", "tt0116281", "tt0116283", "tt5290382", "tt2707408", "tt0286486"];

const modelConfig = loadConfigYAML();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function validateMessageInput(message: string) {
    if (message.length === 0) {
        throw new Error("The message content cannot be empty.");
    }

    if (message.length > modelConfig.model.maxInputTokens) {
        throw new Error("The message content cannot exceed 1024 characters.");
    }
}

const RecommendationSchema = z.object({
    title: z.string(),
    imdb_id: z.string(),
    description: z.string(),
    reasoning: z.string(),
});

type Recommendation = z.infer<typeof RecommendationSchema>;

export async function getMessage(message: any): Promise<Recommendation> {
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
        response_format: zodResponseFormat(RecommendationSchema, "recommendation"),
    });
    console.log("COMPLETION HIT:", completion);

    if (completion.choices[0].message.content === null) {
        throw new Error("Completion content is null.");
    }

    const result = RecommendationSchema.parse(JSON.parse(completion.choices[0].message.content));
    pastRecommendations.push(result.imdb_id);

    console.log("SERVER > past recommendations:", pastRecommendations);

    return result;
};

export const API = { getMessage };
