import { swaggerUI } from '@hono/swagger-ui';
import recommendations from './endpoints/recommendations';
import { openAPISpecs } from 'hono-openapi';
import { Hono } from 'hono';

const app = new Hono();

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

export default app;
