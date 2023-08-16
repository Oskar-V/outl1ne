import { Hono } from "hono";
import { cors } from "hono/cors";
import { getAllDestinations, getAllStops } from "./paths/stops";

const app = new Hono();

// Very rudimentary performance monitoring - should really also be moved to another middleware path file
app.use("/*", async (_, next) => {
  console.time("Request");
  await next();
  console.timeEnd("Request");
});

/**
 * A bit redundant due to serving the API through NGINX, in a proper API almost
 * all networking specific things should be handled in a dedicated service
 */
app.use(
  "/*",
  cors({
    origin: "https://localhost",
    allowMethods: ["POST", "GET", "OPTIONS"],
  })
);

// Should also add a general error handler middleware for centralized error feedback and logging

app.get("/stops", getAllStops);
app.post("/stops", getAllDestinations);

export default app;
