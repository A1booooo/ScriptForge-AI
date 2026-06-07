import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";
import { stringify } from "yaml";

import App from "../App";
import { screenplayToYaml } from "../lib/screenplayToYaml";

if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const successResponse = {
  conversion_id: "conv_real_001",
  status: "completed",
  mode: "dramatic",
  source: "real_llm",
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
  mock: false
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
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:mock-yaml"),
        revokeObjectURL: vi.fn()
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("renders the real conversion header and three default chapter cards", () => {
    render(<App />);

    expect(screen.getByText("ScriptForge AI 剧本工坊")).toBeInTheDocument();
    expect(screen.getByText("T15：真实 LLM 转换工作台")).toBeInTheDocument();
    expect(screen.getByLabelText("项目标题")).toBeInTheDocument();
    expect(screen.getByLabelText("改编模式")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox", { name: "章节 ID" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "章节标题" })).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { name: "章节内容" })).toHaveLength(3);
  });

  test("shows an error and does not submit when fewer than three chapters are complete", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("错误")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("submits valid input to the real conversion api", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/conversions/real",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
  });

  test("shows api error feedback when the real request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "missing_api_key",
            message: "未配置 LLM API Key"
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("未配置 LLM API Key")).toBeInTheDocument();
  });

  test("enters the result workspace after a successful real conversion", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("结构评分", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("conv_real_001")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery Draft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "02 / 结构分析" }));
    expect(screen.getByText("结构分析")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "03 / YAML 合约" }));
    expect(screen.getByLabelText("编辑中的 YAML")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "04 / 草稿视图" }));
    expect(screen.getAllByText("Rumors Under Lantern Light").length).toBeGreaterThan(0);
  });

  test("keeps chapter analyzer bound to the submitted source snapshot instead of live form edits", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("结构评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "02 / 结构分析" }));
    expect(screen.getByText("River Street Mystery")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回修改章节" }));

    fireEvent.change(screen.getByLabelText("项目标题"), {
      target: { value: "Changed After Submit" }
    });

    fireEvent.click(screen.getByRole("button", { name: "查看生成结果" }));
    expect(await screen.findByText("结构评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "02 / 结构分析" }));

    expect(screen.getByText("River Street Mystery")).toBeInTheDocument();
    expect(screen.queryByText("Changed After Submit")).not.toBeInTheDocument();
  });

  test("resets edited yaml when a new conversion result arrives", async () => {
    const secondResponse = {
      ...successResponse,
      conversion_id: "conv_real_002",
      screenplay: {
        ...successResponse.screenplay,
        metadata: {
          ...successResponse.screenplay.metadata,
          title: "Second Draft Title"
        }
      }
    } as const;

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(successResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(secondResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("结构评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03 / YAML 合约" }));
    const editor = screen.getByLabelText("编辑中的 YAML");
    fireEvent.change(editor, {
      target: {
        value: "schema_version: '1.0.0'\nmetadata:\n  title: Changed Locally"
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "返回修改章节" }));
    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("conv_real_002", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03 / YAML 合约" }));

    expect(screen.getByLabelText("编辑中的 YAML")).toHaveValue(
      screenplayToYaml(secondResponse.screenplay)
    );
  });

  test("keeps YAML export gated by validation state", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    fireEvent.click(await screen.findByRole("button", { name: "03 / YAML 合约" }));
    const editor = screen.getByLabelText("编辑中的 YAML");
    expect(screen.getByRole("button", { name: "导出 YAML" })).toBeEnabled();

    fireEvent.change(editor, {
      target: { value: "metadata:\n  title: [broken" }
    });

    expect(await screen.findByText(/yaml_parse_error/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "导出 YAML" })).toBeDisabled()
    );

    fireEvent.change(editor, {
      target: { value: screenplayToYaml(successResponse.screenplay) }
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "导出 YAML" })).toBeEnabled()
    );
  });

  test("exports the current edited yaml instead of the original generated yaml", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement");

    createElementSpy.mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);

      if (tagName.toLowerCase() === "a") {
        Object.defineProperty(element, "click", {
          value: clickSpy
        });
      }

      return element as HTMLElement;
    });

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    fireEvent.click(await screen.findByRole("button", { name: "03 / YAML 合约" }));
    const editor = screen.getByLabelText("编辑中的 YAML");
    const editedYaml = stringify({
      ...successResponse.screenplay,
      metadata: {
        ...successResponse.screenplay.metadata,
        title: "Edited Export Title"
      }
    });

    fireEvent.change(editor, {
      target: { value: editedYaml }
    });

    fireEvent.click(screen.getByRole("button", { name: "导出 YAML" }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0];

    expect(blob).toBeInstanceOf(Blob);
    const blobText = await new Promise<string | null>((resolve, reject) => {
      if (!(blob instanceof Blob)) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });

    expect(blobText).toContain("Edited Export Title");
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test("loads sample chapters without calling any conversion endpoint", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "加载示例章节" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("雨夜之塔")).toBeInTheDocument();
    expect(screen.getAllByLabelText("章节标题").length).toBeGreaterThanOrEqual(3);
  });

  test("adds a fourth chapter and allows removing extra chapters only", () => {
    render(<App />);

    expect(screen.getAllByLabelText("章节标题")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "添加章节" }));
    expect(screen.getAllByLabelText("章节标题")).toHaveLength(4);

    expect(
      screen.getByRole("button", { name: "删除章节 4" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "删除章节 4" }));

    expect(screen.getAllByLabelText("章节标题")).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "删除章节 3" })
    ).not.toBeInTheDocument();
  });

  test("does not show the old demo and mock CTA labels", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Run Demo Sample" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "生成 mock 剧本摘要" })
    ).not.toBeInTheDocument();
  });
  test("shows schema validation details when the real request returns safe summaries", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "schema_validation_failed",
            message: "生成结果未通过 Schema 校验",
            details: [
              "missing required field: scenes[0].location_id",
              "dialogue character_id references unknown character: scenes[0].dialogue[0].character_id"
            ]
          }
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("生成结果未通过 Schema 校验")).toBeInTheDocument();
    expect(screen.getByText("Schema 问题摘要：")).toBeInTheDocument();
    expect(
      screen.getByText("missing required field: scenes[0].location_id")
    ).toBeInTheDocument();
  });

  test("keeps the existing error display when no schema details are returned", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "schema_validation_failed",
            message: "生成结果未通过 Schema 校验"
          }
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "真实 AI 生成剧本" }));

    expect(await screen.findByText("生成结果未通过 Schema 校验")).toBeInTheDocument();
    expect(screen.queryByText("Schema 问题摘要：")).not.toBeInTheDocument();
  });
});
