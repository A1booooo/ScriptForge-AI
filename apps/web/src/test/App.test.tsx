import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";
import { stringify } from "yaml";

import App from "../App";
import { screenplayToYaml } from "../lib/screenplayToYaml";

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

    expect(await screen.findByText("YAML Workspace")).toBeInTheDocument();
    expect(screen.getByText("Chapter Analyzer")).toBeInTheDocument();
    expect(screen.getByText("Demo analysis")).toBeInTheDocument();
    expect(screen.getByText("Generated YAML")).toBeInTheDocument();
    expect(screen.getByLabelText("Edited YAML")).toBeInTheDocument();
    expect(screen.getByText("Validation Result")).toBeInTheDocument();
    expect(screen.getByText("Adaptation Quality Score")).toBeInTheDocument();
    expect(screen.getByText("Deterministic Demo score")).toBeInTheDocument();
    expect(
      screen.getByText(/not a real LLM quality judgment/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("Character Coverage")).toBeInTheDocument();
    expect(screen.getByText("Conflict Clarity")).toBeInTheDocument();
    expect(screen.getByText("Schema Completeness")).toBeInTheDocument();
    expect(screen.getAllByText("Signal source").length).toBeGreaterThan(0);
    expect(screen.getByText("conv_mock_001")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery Draft")).toBeInTheDocument();
    expect(screen.getByText("Preview Checks")).toBeInTheDocument();
    expect(screen.getByText("Scene Board")).toBeInTheDocument();
    expect(screen.getByText("Character Bible")).toBeInTheDocument();
    expect(
      screen.getAllByText("Rumors Under Lantern Light").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Lin Xia").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/schema_version/).length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Preview Checks remains a lightweight panel. The shared validator runtime is not wired into this UI yet."
      )
    ).toBeInTheDocument();
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

    const editor = await screen.findByLabelText("Edited YAML");

    expect(screen.getByText("Schema Completeness")).toBeInTheDocument();
    expect(screen.getByText("Validation currently passes without parse, schema, or consistency issues.")).toBeInTheDocument();

    fireEvent.change(editor, {
      target: { value: "metadata:\n  title: [broken" }
    });

    expect(await screen.findByText(/yaml_parse_error/i)).toBeInTheDocument();
    expect(
      screen.getByText(/current validation state reports 1 issue/i)
    ).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: /mock/i }));

    expect(await screen.findByText("Chapter Analyzer")).toBeInTheDocument();
    expect(screen.getByText("River Street Mystery")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("项目标题"), {
      target: { value: "Changed After Submit" }
    });

    expect(screen.getByDisplayValue("Changed After Submit")).toBeInTheDocument();
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

    const editor = await screen.findByLabelText("Edited YAML");
    fireEvent.change(editor, {
      target: {
        value: "schema_version: '1.0.0'\nmetadata:\n  title: Changed Locally"
      }
    });

    expect(screen.getByDisplayValue(/Changed Locally/)).toBeInTheDocument();

    fireEvent.click(submitButton);

    await screen.findByText("conv_mock_002");

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

    const editor = await screen.findByLabelText("Edited YAML");
    const exportButton = screen.getByRole("button", { name: "Export YAML" });

    expect(exportButton).toBeEnabled();

    fireEvent.change(editor, {
      target: { value: "metadata:\n  title: [broken" }
    });

    expect(await screen.findByText("Validation Result")).toBeInTheDocument();
    await waitFor(() => expect(exportButton).toBeDisabled());
    expect(screen.getByText(/yaml_parse_error/i)).toBeInTheDocument();

    fireEvent.change(editor, {
      target: { value: screenplayToYaml(successResponse.screenplay) }
    });

    await waitFor(() => expect(exportButton).toBeEnabled());
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

    const editor = await screen.findByLabelText("Edited YAML");
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
});
