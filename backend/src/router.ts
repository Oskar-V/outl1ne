import { Hono } from "hono";

const app = new Hono();

app.use(async (c, next) => {
  console.time("Request");
  await next();
  console.timeEnd("Request");
});

app.get("/", (c) => {
  return c.json({ message: "Hello World!" });
});

export default app;
