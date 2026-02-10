import type { AgentEvent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import {
  type AgentFactory,
  type AgentLike,
  createDefaultAgentFactory,
  type GenerationDeps,
  type GenerationState,
} from "./agent-interface";
import type {
  GenerationEvent,
  TokenUsage,
  ToolCallMetrics,
} from "./generation-events";
import { AGENT_SYSTEM_PROMPT } from "./system-prompt";
import { createTools } from "./tools";
import type { SiteSpec } from "./types";

export type {
  AgentFactory,
  AgentLike,
  GenerationDeps,
  GenerationState,
  PageDetails,
} from "./agent-interface";
export { validateHtml } from "./agent-interface";
export { createTools } from "./tools";
export type {
  GenerationEvent,
  TokenUsage,
  ToolActivityEvent,
  ToolCallMetrics,
} from "./generation-events";
export { AGENT_SYSTEM_PROMPT } from "./system-prompt";

export async function* generateWebsite(
  userRequest: string,
  existingSpec?: SiteSpec,
  existingPages?: Record<string, string>,
  deps?: GenerationDeps,
): AsyncGenerator<GenerationEvent> {
  const state: GenerationState = {
    spec: existingSpec || null,
    pages: existingPages ? { ...existingPages } : {},
    validationPassed: false,
  };

  const model = deps?.model ?? getModel("openai", "gpt-5.2");

  const apiKey = deps?.apiKey ?? process.env.OPENAI_API_KEY;

  const tools = createTools(state);

  const agentFactory: AgentFactory =
    deps?.agentFactory ?? createDefaultAgentFactory();

  const agent: AgentLike = agentFactory(
    {
      systemPrompt: AGENT_SYSTEM_PROMPT,
      model,
      tools,
      thinkingLevel: "low",
      messages: [],
    },
    () => apiKey,
  );

  yield { type: "status", message: "Starting website generation..." };

  const isModification =
    existingSpec && existingPages && Object.keys(existingPages).length > 0;
  console.log(`\n${"=".repeat(80)}`);
  console.log("[AGENT] Generation started");
  console.log("[AGENT] Mode:", isModification ? "MODIFICATION" : "NEW SITE");
  console.log("[AGENT] User request:", userRequest);
  if (isModification) {
    console.log(
      "[AGENT] Existing pages:",
      Object.keys(existingPages as Record<string, string>),
    );
    console.log("[AGENT] Existing spec name:", existingSpec?.name);
  }
  console.log(`${"=".repeat(80)}\n`);

  let prompt: string;

  if (isModification) {
    prompt = `## MODIFICATION REQUEST
${userRequest}

IMPORTANT: You are MODIFYING an existing website. Follow these steps:
1. DO NOT call plan_site or write_page — the site already exists
2. Call read_page for each page you need to inspect
3. Call edit_page with targeted search/replace edits — change ONLY what the user asked for
4. Keep all existing content, styling, and structure intact unless the user specifically asks to change it
5. After all edits, call validate_site

The site has these pages: ${Object.keys(existingPages as Record<string, string>).join(", ")}

START by calling read_page to inspect the relevant page(s), then apply edits.`;
  } else {
    prompt = userRequest;
  }

  const eventQueue: GenerationEvent[] = [];
  let resolveWait: (() => void) | null = null;
  let agentDone = false;
  let runError: unknown = null;

  const tokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  const toolMetrics: ToolCallMetrics = {
    totalToolCalls: 0,
    writePageCalls: 0,
    editPageCalls: 0,
    validateSiteCalls: 0,
    pagesPassedValidation: 0,
    pagesFailedValidation: 0,
    fixAttemptsPerPage: {},
  };

  const unsubscribe = agent.subscribe((event: AgentEvent) => {
    let newEvent: GenerationEvent | null = null;

    if (event.type !== "message_update") {
      console.log("[AGENT EVENT]", event.type);
    }

    switch (event.type) {
      case "tool_execution_start": {
        console.log("[AGENT] Tool execution START:", event.toolName);
        const argsPreview = JSON.stringify(event.args, null, 2);
        console.log(
          "[AGENT] Tool args:",
          `${argsPreview?.slice(0, 200)}${argsPreview && argsPreview.length > 200 ? "..." : ""}`,
        );
        const startArgs = event.args as Record<string, unknown> | undefined;
        eventQueue.push({
          type: "tool_activity",
          toolName: event.toolName,
          status: "start",
          args: startArgs,
        });
        if (event.toolName === "plan_site") {
          newEvent = { type: "status", message: "Creating site plan..." };
        } else if (event.toolName === "write_page") {
          const filename =
            (event.args as { filename?: string })?.filename || "page";
          newEvent = {
            type: "status",
            message: `Writing ${filename}...`,
          };
        } else if (event.toolName === "edit_page") {
          const filename =
            (event.args as { filename?: string })?.filename || "page";
          newEvent = {
            type: "status",
            message: `Editing ${filename}...`,
          };
        } else if (event.toolName === "read_page") {
          const filename =
            (event.args as { filename?: string })?.filename || "page";
          newEvent = {
            type: "status",
            message: `Reading ${filename}...`,
          };
        } else if (event.toolName === "validate_site") {
          newEvent = { type: "status", message: "Validating site..." };
        }
        break;
      }

      case "tool_execution_end": {
        console.log("[AGENT] Tool execution END:", event.toolName);
        const resultPreview = JSON.stringify(event.result?.content, null, 2);
        console.log(
          "[AGENT] Tool result:",
          `${resultPreview?.slice(0, 200)}${resultPreview && resultPreview.length > 200 ? "..." : ""}`,
        );

        toolMetrics.totalToolCalls++;

        const toolName = event.toolName;
        const details = event.result?.details as
          | Record<string, unknown>
          | undefined;

        if (toolName === "write_page") {
          toolMetrics.writePageCalls++;
          if (details) {
            if (details.valid === true) {
              toolMetrics.pagesPassedValidation++;
            } else if (details.valid === false) {
              toolMetrics.pagesFailedValidation++;
            }
          }
        } else if (toolName === "edit_page") {
          toolMetrics.editPageCalls++;
          if (details) {
            const filename = details.filename as string;
            toolMetrics.fixAttemptsPerPage[filename] =
              (toolMetrics.fixAttemptsPerPage[filename] || 0) + 1;
          }
        } else if (toolName === "validate_site") {
          toolMetrics.validateSiteCalls++;
        }

        const resultSuccess = details?.valid !== false;
        const resultMessage =
          typeof event.result?.content === "string"
            ? event.result.content.slice(0, 100)
            : undefined;
        eventQueue.push({
          type: "tool_activity",
          toolName,
          status: "end",
          result: {
            success: resultSuccess,
            message: resultMessage,
          },
        });

        if (details) {
          if (details.spec) {
            newEvent = { type: "spec", spec: details.spec as SiteSpec };
          }
          if (details.filename && details.html && details.valid) {
            eventQueue.push({
              type: "page",
              filename: details.filename as string,
              html: details.html as string,
            });
          }
        }
        break;
      }

      case "message_end": {
        const msg = event.message;
        if (msg && typeof msg === "object" && "role" in msg) {
          console.log("[AGENT] Message end - role:", msg.role);
          if ("content" in msg && Array.isArray(msg.content)) {
            for (const block of msg.content) {
              if (block.type === "text" && "text" in block) {
                console.log(
                  "[AGENT] Assistant text response:",
                  (block.text as string).slice(0, 500),
                );
              } else if (block.type === "toolCall") {
                console.log(
                  "[AGENT] Tool call in message:",
                  (block as { name?: string }).name,
                );
              }
            }
          }
        }
        if (msg && typeof msg === "object") {
          if ("role" in msg && msg.role === "assistant") {
            const usageAny =
              "usage" in msg
                ? (msg.usage as unknown as Record<string, unknown>)
                : null;
            if (usageAny && typeof usageAny === "object") {
              const input = (usageAny.input ??
                usageAny.prompt_tokens ??
                usageAny.input_tokens ??
                0) as number;
              const output = (usageAny.output ??
                usageAny.completion_tokens ??
                usageAny.output_tokens ??
                0) as number;
              const total = (usageAny.totalTokens ??
                usageAny.total_tokens ??
                usageAny.total ??
                input + output) as number;

              tokenUsage.inputTokens += input;
              tokenUsage.outputTokens += output;
              tokenUsage.totalTokens += total;
              newEvent = { type: "usage", usage: { ...tokenUsage } };
            }
          }
        }
        break;
      }

      case "message_update":
        break;

      case "agent_end":
        console.log("[AGENT] Agent finished");
        console.log("[AGENT] Final state.pages:", Object.keys(state.pages));
        console.log("[AGENT] Final state.spec:", state.spec?.name);
        console.log("[AGENT] Tool metrics:", JSON.stringify(toolMetrics));
        agentDone = true;
        break;
    }

    if (newEvent) {
      eventQueue.push(newEvent);
    }
    if (resolveWait) {
      resolveWait();
      resolveWait = null;
    }
  });

  const runPromise = agent
    .prompt(prompt)
    .catch((err) => {
      runError = err;
      eventQueue.push({
        type: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        usage: tokenUsage,
        toolMetrics,
      });
    })
    .finally(() => {
      agentDone = true;
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
    });

  while (!agentDone || eventQueue.length > 0) {
    if (eventQueue.length > 0) {
      const ev = eventQueue.shift();
      if (ev) yield ev;
    } else if (!agentDone) {
      await new Promise<void>((resolve) => {
        resolveWait = resolve;
        setTimeout(resolve, 100);
      });
    }
  }

  await runPromise;
  unsubscribe();

  if (runError) {
    return;
  }

  if (Object.keys(state.pages).length > 0 && state.spec) {
    yield {
      type: "complete",
      pages: state.pages,
      spec: state.spec,
      usage: tokenUsage,
      toolMetrics,
    };
  } else if (Object.keys(state.pages).length > 0) {
    const minimalSpec: SiteSpec = {
      name: "Website",
      tagline: "",
      type: "landing",
      industry: "general",
      audience: "general",
      tone: "professional",
      colorPalette: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#1f2937",
      },
      typography: { headingStyle: "modern", bodyFont: "sans" },
      pages: [],
      features: [],
    };
    yield {
      type: "complete",
      pages: state.pages,
      spec: minimalSpec,
      usage: tokenUsage,
      toolMetrics,
    };
  } else {
    yield {
      type: "error",
      error: "No pages were generated",
      usage: tokenUsage,
      toolMetrics,
    };
  }
}
