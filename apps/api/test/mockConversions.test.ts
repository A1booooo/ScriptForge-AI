import { describe, expect, it } from "vitest";

import { buildServer } from "../src/server.js";

const validPayload = {
  title: "River Street Mystery",
  adaptation_mode: "dramatic",
  chapters: [
    {
      id: "chapter_01",
      title: "Dawn Letter",
      content: "Lin Xia receives a letter at dawn."
    },
    {
      id: "chapter_02",
      title: "Market Rumors",
      content: "She searches the market for clues."
    },
    {
      id: "chapter_03",
      title: "Watchtower Rain",
      content: "She confronts the captain at night."
    }
  ]
} as const;

describe("POST /api/conversions/mock", () => {
  it("returns a mock screenplay for valid 3-chapter input", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.mock).toBe(true);
    expect(body.status).toBe("completed");
    expect(body.mode).toBe("dramatic");
    expect(body.conversion_id).toEqual(expect.any(String));
    expect(body.input_summary).toEqual({
      title: "River Street Mystery",
      chapter_count: 3,
      chapter_ids: [
        "chapter_01",
        "chapter_02",
        "chapter_03"
      ]
    });
    expect(body.warnings).toContain("Mock response only. No real LLM conversion was performed.");
    expect(body.screenplay.schema_version).toBe("1.0.0");
    expect(body.screenplay.metadata.adaptation_mode).toBe("dramatic");
  });

  it("returns 400 when chapters contain fewer than 3 items", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: {
        ...validPayload,
        chapters: validPayload.chapters.slice(0, 2)
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: expect.any(String)
      }
    });
  });

  it("returns 400 when adaptation_mode is invalid", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: {
        ...validPayload,
        adaptation_mode: "cinematic"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: expect.any(String)
      }
    });
  });

  it("returns 400 when a chapter field is empty", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: {
        ...validPayload,
        chapters: [
          {
            ...validPayload.chapters[0],
            content: ""
          },
          ...validPayload.chapters.slice(1)
        ]
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: expect.any(String)
      }
    });
  });

  it("returns 400 when a chapter field is missing", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: {
        ...validPayload,
        chapters: [
          {
            id: "chapter_01",
            content: "Missing title field."
          },
          ...validPayload.chapters.slice(1)
        ]
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: expect.any(String)
      }
    });
  });

  it("returns 400 when title is empty", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/mock",
      payload: {
        ...validPayload,
        title: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: expect.any(String)
      }
    });
  });
});
