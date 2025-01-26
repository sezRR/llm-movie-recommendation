import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";

interface InstructionConfig {
    systemInstructions: string;
    model: {
        name: string;
        maxOutputTokens: number;
        maxInputTokens: number;
    };
}

export const loadConfig = (fileName: string = "instruction_conf.json"): InstructionConfig => {
    const projectRoot = process.cwd();
    const configPath = resolve(projectRoot, fileName);
    const configContent = readFileSync(configPath, "utf-8");
    return JSON.parse(configContent) as InstructionConfig;
};

export const loadConfigYAML = (fileName: string = "instruction_conf.yaml"): InstructionConfig => {
    const projectRoot = process.cwd();
    const configPath = resolve(projectRoot, fileName);
    const configContent = readFileSync(configPath, "utf-8");
    return parse(configContent) as InstructionConfig;
}

export const config = {
    jwtExpiration: '1h', // You can adjust this value as needed
};