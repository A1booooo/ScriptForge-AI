import Fastify, { type FastifyInstance } from "fastify";

import healthRoute from "./routes/health.js";
import mockConversionsRoute from "./routes/mockConversions.js";

export function buildServer(): FastifyInstance {
  const app = Fastify();

  app.register(healthRoute);
  app.register(mockConversionsRoute);

  return app;
}
