import Fastify, { type FastifyInstance } from "fastify";

import { createLlmClient } from "./llm/factory.js";
import type { LlmClient } from "./llm/client.js";
import healthRoute from "./routes/health.js";
import mockConversionsRoute from "./routes/mockConversions.js";
import realConversionsRoute from "./routes/realConversions.js";

interface BuildServerOptions {
  createLlmClient?: typeof createLlmClient;
  llmClient?: LlmClient;
}

export function buildServer(options: BuildServerOptions = {}): FastifyInstance {
  const app = Fastify();

  app.register(healthRoute);
  app.register(mockConversionsRoute);
  app.register(realConversionsRoute, options);

  return app;
}
