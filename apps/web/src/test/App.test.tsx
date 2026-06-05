import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import App from "../App";

const successResponse = {
  conversion_id: "conv_mock_001",
  status: "completed",
  mode: "dramatic",
  input_summary: {
    title: "River Street Mystery",
    chapter_count: 3,
    chapter_ids: ["chapter_01", "chapter_02", "chapter_03"]
  },
  screenplay: {
    ...sampleScreenplay,
    metadata: {
      ...sampleScreenplay.metadata,
      title: "River Street Mystery Draft"
    }
  },
  warnings: [],
  mock: true
} as const;

function fillMinimumValidForm() {
  fireEvent.change(screen.getByLabelText("项目标题"), {
    target: { value: "River Street Mystery" }
  });

  fireEvent.change(screen.getByLabelText("改编模式"), {
    target: { value: "dramatic" }
  });

  const idInputs = screen.getAllByLabelText("章节 ID");
  const titleInputs = screen.getAllByLabelText("章节标题");
  const contentInputs = screen.getAllByLabelText("章节内容");

  idInputs.forEach((input, index) => {
    fireEvent.change(input, {
      target: { value: `chapter_0${index + 1}` }
    });
  });

  titleInputs.forEach((input, index) => {
    fireEvent.change(input, {
      target: { value: `Chapter ${index + 1}` }
    });
  });

  contentInputs.forEach((input, index) => {
    fireEvent.change(input, {
      target: { value: `This is chapter ${index + 1} content.` }
    });
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("renders header, mode selector, and three chapter cards", () => {
    render(<App />);

    expect(screen.getByText("ScriptForge AI 剧本工坊")).toBeInTheDocument();
    expect(screen.getByText("T04：章节输入工作台 · Mock API")).toBeInTheDocument();
    expect(screen.getByLabelText("项目标题")).toBeInTheDocument();
    expect(screen.getByLabelText("改编模式")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox", { name: "章节 ID" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "章节标题" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "章节内容" })).toHaveLength(3);
  });

  test("shows an error and does not submit when fewer than three chapters are filled", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("项目标题"), {
      target: { value: "River Street Mystery" }
    });

    const idInputs = screen.getAllByLabelText("章节 ID");
    const titleInputs = screen.getAllByLabelText("章节标题");
    const contentInputs = screen.getAllByLabelText("章节内容");

    [0, 1].forEach((index) => {
      fireEvent.change(idInputs[index]!, {
        target: { value: `chapter_0${index + 1}` }
      });
      fireEvent.change(titleInputs[index]!, {
        target: { value: `Chapter ${index + 1}` }
      });
      fireEvent.change(contentInputs[index]!, {
        target: { value: `This is chapter ${index + 1} content.` }
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("submits valid input to the mock conversion api", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/conversions/mock",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
  });

  test("shows api error feedback when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "INVALID_REQUEST",
            message: "chapters must contain at least 3 items."
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    expect(
      await screen.findByText("chapters must contain at least 3 items.")
    ).toBeInTheDocument();
  });

  test("shows yaml preview and preview checks after a successful conversion", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    expect(await screen.findByText("YAML Preview")).toBeInTheDocument();
    expect(screen.getByText("conv_mock_001")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery Draft")).toBeInTheDocument();
    expect(screen.getByText("Preview Checks")).toBeInTheDocument();
    expect(screen.getAllByText(/schema_version/).length).toBeGreaterThan(0);
    expect(screen.getByText("Full schema validator planned for later.")).toBeInTheDocument();
  });
});
