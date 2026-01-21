import { generateWebsite } from "@/lib/generation/agent";
import type { SiteSpec } from "@/lib/generation/types";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const { messages, currentPages, existingSpec } = (await req.json()) as {
    messages: Message[];
    currentPages?: Record<string, string>;
    existingSpec?: SiteSpec;
  };

  const lastMessage = messages[messages.length - 1];
  const userRequest = lastMessage.content;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generateWebsite(
          userRequest,
          existingSpec,
          currentPages,
        )) {
          const chunk = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`,
          ),
        );
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
