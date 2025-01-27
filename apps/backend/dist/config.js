"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.loadConfigYAML = exports.loadConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = require("yaml");
const loadConfig = (fileName = "instruction_conf.json") => {
    const projectRoot = process.cwd();
    const configPath = (0, path_1.resolve)(projectRoot, fileName);
    const configContent = (0, fs_1.readFileSync)(configPath, "utf-8");
    return JSON.parse(configContent);
};
exports.loadConfig = loadConfig;
const loadConfigYAML = (fileName = "instruction_conf.yaml") => {
    const projectRoot = process.cwd();
    const configPath = (0, path_1.resolve)(projectRoot, fileName);
    const configContent = (0, fs_1.readFileSync)(configPath, "utf-8");
    return (0, yaml_1.parse)(configContent);
};
exports.loadConfigYAML = loadConfigYAML;
exports.config = {
    jwtExpiration: '1h', // You can adjust this value as needed
};
