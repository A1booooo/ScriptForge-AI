import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import App from "../App";

const successResponse = {
  conversion_id: "conv_mock_001",
  status: "completed",
  mode: "dramatic",
  input_summary: {
    title: "雾港追缉令",
    chapter_count: 3,
    chapter_ids: ["chapter_01", "chapter_02", "chapter_03"]
  },
  screenplay: {
    metadata: {
      title: "雾港追缉令：剧本草稿"
    }
  },
  warnings: [],
  mock: true
};

function fillMinimumValidForm() {
  fireEvent.change(screen.getByLabelText("项目标题"), {
    target: { value: "雾港追缉令" }
  });

  const modeSelect = screen.getByLabelText("改编模式");
  fireEvent.change(modeSelect, {
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
      target: { value: `第 ${index + 1} 章` }
    });
  });

  contentInputs.forEach((input, index) => {
    fireEvent.change(input, {
      target: { value: `这是第 ${index + 1} 章的正文内容。` }
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
      target: { value: "雾港追缉令" }
    });

    const idInputs = screen.getAllByLabelText("章节 ID");
    const titleInputs = screen.getAllByLabelText("章节标题");
    const contentInputs = screen.getAllByLabelText("章节内容");

    [0, 1].forEach((index) => {
      fireEvent.change(idInputs[index]!, {
        target: { value: `chapter_0${index + 1}` }
      });
      fireEvent.change(titleInputs[index]!, {
        target: { value: `第 ${index + 1} 章` }
      });
      fireEvent.change(contentInputs[index]!, {
        target: { value: `这是第 ${index + 1} 章的正文内容。` }
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    expect(
      await screen.findByText("请至少填写 3 个完整章节后再提交。")
    ).toBeInTheDocument();
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

  test("shows a success summary after a successful conversion", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    expect(await screen.findByText("Mock 剧本草稿已生成")).toBeInTheDocument();
    expect(screen.getByText("conv_mock_001")).toBeInTheDocument();
    expect(screen.getByText("是")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("雾港追缉令：剧本草稿")).toBeInTheDocument();
  });
});
