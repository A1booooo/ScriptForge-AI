import type { FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    ok: true,
    service: "scriptforge-api"
  }));
};

export default healthRoute;
