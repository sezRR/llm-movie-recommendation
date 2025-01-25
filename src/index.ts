import { swaggerUI } from '@hono/swagger-ui';
import recommendations from './endpoints/recommendations';
import { openAPISpecs } from 'hono-openapi';
import { Hono, type Context } from 'hono';
import { Auth } from './auth';

const app = new Hono({ strict: false }).basePath("/");

app.get(
    '/openapi',
    openAPISpecs(app, {
        documentation: {
            info: { title: 'Hono API', version: '1.0.0', description: 'Greeting API' },
            servers: [{ url: 'http://localhost:3000', description: 'Local Server' }],
        },
    })
);

app.get('/docs', swaggerUI({ url: '/openapi' }));

app.route("/recommendations", recommendations)

app.use("/api/*", Auth.securityMiddleware)

app.get("/api", (c: Context) => {
    return c.json({ message: `Hello, ${JSON.parse(c.get("token_json")).payload.given_name}` });
})

app.route("/auth", Auth.endpoints)

export default app;
