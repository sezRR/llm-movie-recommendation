"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_1 = require("@hono/swagger-ui");
const recommendations_1 = __importDefault(require("./endpoints/recommendations"));
const hono_openapi_1 = require("hono-openapi");
const hono_1 = require("hono");
const auth_1 = require("./auth");
const env_1 = require("./config/env");
const env = (0, env_1.validateEnv)();
const app = new hono_1.Hono({ strict: false }).basePath("/");
app.get('/openapi', (0, hono_openapi_1.openAPISpecs)(app, {
    documentation: {
        info: { title: 'Hono API', version: '1.0.0', description: 'Greeting API' },
        servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local Server' }],
    },
}));
app.get('/docs', (0, swagger_ui_1.swaggerUI)({ url: '/openapi' }));
app.route("/recommendations", recommendations_1.default);
app.use("/api/*", auth_1.Auth.securityMiddleware);
app.get("/api", (c) => {
    return c.json({ message: `Hello, ${JSON.parse(c.get("token_json")).payload.given_name}` });
});
app.route("/auth", auth_1.Auth.endpoints);
exports.default = app;
