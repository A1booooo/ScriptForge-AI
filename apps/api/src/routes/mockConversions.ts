import type { FastifyPluginAsync } from "fastify";

import { createMockConversionResponse } from "../services/mockConversionService.js";
import {
  createApiError,
  parseConversionRequest
} from "./conversionRequest.js";

const mockConversionsRoute: FastifyPluginAsync = async (app) => {
  app.post("/api/conversions/mock", async (request, reply) => {
    try {
      const payload = parseConversionRequest(request.body);

      return createMockConversionResponse(payload);
    } catch (error) {
      return reply.status(400).send(
        createApiError(
          "INVALID_REQUEST",
          error instanceof Error ? error.message : "Invalid request."
        )
      );
    }
  });
};

export default mockConversionsRoute;
