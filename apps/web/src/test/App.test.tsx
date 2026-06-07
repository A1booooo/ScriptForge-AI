import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";
import { stringify } from "yaml";

import App from "../App";
import { DEMO_SAMPLE_BADGE_LABEL } from "../lib/demoFixtures";
import { screenplayToYaml } from "../lib/screenplayToYaml";

if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}


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

    // 1. Overview tab (Default)
    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getAllByText("就绪度 / 质量评分").length).toBeGreaterThan(0);
    expect(screen.getByText("确定性 Demo 评分")).toBeInTheDocument();
    expect(screen.getByText("结构就绪度")).toBeInTheDocument();
    expect(screen.getByText("角色覆盖度")).toBeInTheDocument();
    expect(screen.getByText("冲突清晰度")).toBeInTheDocument();
    expect(screen.getByText("Schema 完整度")).toBeInTheDocument();
    expect(screen.getByText("conv_mock_001")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery Draft")).toBeInTheDocument();

    // 2. Switch to Analysis tab
    fireEvent.click(screen.getByRole("button", { name: "Analysis" }));
    expect(screen.getByText("Chapter Analyzer")).toBeInTheDocument();
    expect(screen.getByText("Demo analysis")).toBeInTheDocument();
    expect(screen.getByText("修改建议")).toBeInTheDocument();
    expect(screen.getByText("确定性 Demo 建议")).toBeInTheDocument();
    expect(screen.getAllByText("建议类型").length).toBeGreaterThan(0);
    expect(screen.getAllByText("作用对象").length).toBeGreaterThan(0);
    expect(screen.getAllByText("建议原因").length).toBeGreaterThan(0);
    expect(screen.getAllByText("信号来源").length).toBeGreaterThan(0);
    expect(screen.getByText("dialogue-enhancement")).toBeInTheDocument();
    expect(screen.getByText("pacing-adjustment")).toBeInTheDocument();
    expect(screen.getByText("scene-compression")).toBeInTheDocument();

    // 3. Switch to Contract tab
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));
    expect(screen.getByText("YAML 合约工作区")).toBeInTheDocument();
    expect(screen.getByText("生成基线")).toBeInTheDocument();
    expect(screen.getByLabelText("Edited YAML")).toBeInTheDocument();
    expect(screen.getByText("校验结果")).toBeInTheDocument();
    expect(screen.getByText("预览检查")).toBeInTheDocument();
    expect(
      screen.getByText(
        "预览检查仍为轻量级面板。共享校验器运行时尚未接入此 UI。"
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/schema_version/).length).toBeGreaterThan(0);

    // 4. Switch to Draft View tab
    fireEvent.click(screen.getByRole("button", { name: "Draft View" }));
    expect(screen.getByText("场景板")).toBeInTheDocument();
    expect(screen.getByText("角色档案")).toBeInTheDocument();
    expect(
      screen.getAllByText("Rumors Under Lantern Light").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Lin Xia").length).toBeGreaterThan(0);
  });

  test("updates schema completeness when the current validation state becomes invalid", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: /mock/i }));

    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Schema 完整度")).toBeInTheDocument();
    expect(screen.getByText("校验当前已通过，没有解析、Schema 或一致性问题。")).toBeInTheDocument();

    // Switch to Contract tab to edit YAML
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));
    const editor = screen.getByLabelText("Edited YAML");

    fireEvent.change(editor, {
      target: { value: "metadata:\n  title: [broken" }
    });

    expect(await screen.findByText(/yaml_parse_error/i, {}, { timeout: 3000 })).toBeInTheDocument();

    // Switch back to Overview to verify quality score dimension updates
    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(
      screen.getByText(/当前校验状态报告了 1 个问题/)
    ).toBeInTheDocument();
  });

  test("keeps chapter analyzer bound to the submitted source snapshot instead of live form edits", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(successResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    // Switch to Analysis tab
    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Analysis" }));
    expect(screen.getByText("Chapter Analyzer")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery")).toBeInTheDocument();

    // Go back to input view to change fields
    fireEvent.click(screen.getByRole("button", { name: "← 返回修改章节" }));

    fireEvent.change(screen.getByLabelText("项目标题"), {
      target: { value: "Changed After Submit" }
    });

    expect(screen.getByDisplayValue("Changed After Submit")).toBeInTheDocument();

    // Switch back to results using the "查看生成结果" button
    fireEvent.click(screen.getByRole("button", { name: "查看生成结果" }));
    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Analysis" }));

    expect(screen.getByText("River Street Mystery")).toBeInTheDocument();
    expect(screen.queryByText("Changed After Submit")).not.toBeInTheDocument();
  });

  test("resets edited yaml when a new conversion result arrives", async () => {
    const secondResponse = {
      ...successResponse,
      conversion_id: "conv_mock_002",
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

    const submitButton = screen.getByRole("button", {
      name: "生成 mock 剧本摘要"
    });

    fireEvent.click(submitButton);

    // Switch to Contract tab to edit
    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));
    const editor = screen.getByLabelText("Edited YAML");
    fireEvent.change(editor, {
      target: {
        value: "schema_version: '1.0.0'\nmetadata:\n  title: Changed Locally"
      }
    });

    expect(screen.getByDisplayValue(/Changed Locally/)).toBeInTheDocument();

    // Go back to input to resubmit
    fireEvent.click(screen.getByRole("button", { name: "← 返回修改章节" }));
    
    // Query the newly mounted submit button
    const submitButton2 = screen.getByRole("button", { name: "生成 mock 剧本摘要" });
    fireEvent.click(submitButton2);

    // Switch back to Contract tab
    expect(await screen.findByText("conv_mock_002", {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));

    expect(screen.getByLabelText("Edited YAML")).toHaveValue(
      screenplayToYaml(secondResponse.screenplay)
    );
    expect(screen.queryByDisplayValue(/Changed Locally/)).not.toBeInTheDocument();
  });

  test("disables export when edited yaml is invalid and re-enables it after fixing the yaml", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);
    fillMinimumValidForm();

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    // Switch to Contract tab
    fireEvent.click(await screen.findByRole("button", { name: "Contract" }));
    const editor = screen.getByLabelText("Edited YAML");
    expect(
      screen.getByRole("button", { name: "Export YAML" })
    ).toBeEnabled();

    fireEvent.change(editor, {
      target: { value: "metadata:\n  title: [broken" }
    });

    expect(screen.getByText(/yaml_parse_error/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Export YAML" })
      ).toBeDisabled()
    );

    fireEvent.change(editor, {
      target: { value: screenplayToYaml(successResponse.screenplay) }
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Export YAML" })
      ).toBeEnabled()
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

    fireEvent.click(screen.getByRole("button", { name: "生成 mock 剧本摘要" }));

    // Switch to Contract tab
    fireEvent.click(await screen.findByRole("button", { name: "Contract" }));
    const editor = screen.getByLabelText("Edited YAML");
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

    fireEvent.click(screen.getByRole("button", { name: "Export YAML" }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0];

    expect(blob).toBeInstanceOf(Blob);
    const blobText = await new Promise<string | null>((resolve, reject) => {
      if (!(blob instanceof Blob)) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });

    expect(blobText).toContain("Edited Export Title");
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test("runs the demo sample through the existing mock conversion flow and shows demo disclosure in entry and result areas", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    expect(
      screen.getByText(
        /loads the demo sample and immediately submits it through the existing mock conversion flow/i
      )
    ).toBeInTheDocument();

    // Verify entry disclosure is present initially:
    expect(screen.getAllByText(DEMO_SAMPLE_BADGE_LABEL)).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Run Demo Sample" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/conversions/mock",
      expect.objectContaining({
        method: "POST"
      })
    );

    // Wait for result view to load (Overview page is default)
    expect(await screen.findByText("改编质量评分", {}, { timeout: 3000 })).toBeInTheDocument();

    // Verify result disclosure badge is present:
    expect(screen.getAllByText(DEMO_SAMPLE_BADGE_LABEL)).toHaveLength(1);
    expect(
      screen.getAllByText(/not real user data and not real llm output/i)
    ).toHaveLength(1);

    // Switch to Analysis tab
    fireEvent.click(screen.getByRole("button", { name: "Analysis" }));
    expect(screen.getByText("Chapter Analyzer")).toBeInTheDocument();
    expect(screen.getByText("修改建议")).toBeInTheDocument();

    // Switch to Contract tab
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));
    expect(screen.getByText("YAML 合约工作区")).toBeInTheDocument();
    expect(screen.getByText("校验结果")).toBeInTheDocument();

    // Switch to Draft View tab
    fireEvent.click(screen.getByRole("button", { name: "Draft View" }));
    expect(screen.getByText("场景板")).toBeInTheDocument();
    expect(screen.getByText("角色档案")).toBeInTheDocument();
  });
});
