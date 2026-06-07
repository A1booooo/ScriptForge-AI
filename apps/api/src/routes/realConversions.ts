import type { FastifyPluginAsync } from "fastify";

import { LlmClientError } from "../llm/errors.js";
import { createLlmClient } from "../llm/factory.js";
import type { LlmClient } from "../llm/client.js";
import { createRealConversionResponse } from "../services/realConversionService.js";
import {
  createApiError,
  parseConversionRequest
} from "./conversionRequest.js";

interface RealConversionsRouteOptions {
  createLlmClient?: typeof createLlmClient;
  llmClient?: LlmClient;
}

function mapErrorToStatusCode(error: LlmClientError): number {
  switch (error.code) {
    case "missing_api_key":
      return 500;
    case "invalid_provider":
      return 500;
    case "timeout":
    case "rate_limited":
      return 503;
    case "request_failed":
    case "provider_response_invalid":
    case "schema_validation_failed":
      return 502;
    default:
      return 500;
  }
}

function mapErrorToMessage(error: LlmClientError): string {
  switch (error.code) {
    case "missing_api_key":
      return "未配置 LLM API Key";
    case "invalid_provider":
      return "LLM Provider 配置无效";
    case "timeout":
    case "rate_limited":
      return "请求超时或频率限制";
    case "provider_response_invalid":
      return "LLM 返回内容不是合法结构化剧本";
    case "schema_validation_failed":
      return "生成结果未通过 Schema 校验";
    case "request_failed":
      return "LLM 请求失败";
    default:
      return "LLM 请求失败";
  }
}

const realConversionsRoute: FastifyPluginAsync<RealConversionsRouteOptions> =
  async (app, options) => {
    app.post("/api/conversions/real", async (request, reply) => {
      try {
        const payload = parseConversionRequest(request.body);

        return await createRealConversionResponse(payload, {
          ...(options.createLlmClient
            ? { createLlmClient: options.createLlmClient }
            : {}),
          ...(options.llmClient ? { llmClient: options.llmClient } : {})
        });
      } catch (error) {
        if (error instanceof LlmClientError) {
          return reply.status(mapErrorToStatusCode(error)).send(
            createApiError(
              error.code,
              mapErrorToMessage(error)
            )
          );
        }

        return reply.status(400).send(
          createApiError(
            "INVALID_REQUEST",
            error instanceof Error ? error.message : "Invalid request."
          )
        );
      }
    });
  };

export default realConversionsRoute;
