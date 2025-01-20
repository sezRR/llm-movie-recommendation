import { Hono } from 'hono';
import { API } from './api';

const app = new Hono();

app.get('/', (c) => {
  return c.text(`Hello, Hono! ${process.env.PORT}`);
});

app.post('/test-api', async (c) => {
  try {
    const content = await c.req.json();
    const result = await API.getMessage(content);
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: error }, 400);
  }
});

export default app;
