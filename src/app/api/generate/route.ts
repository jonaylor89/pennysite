import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `### ROLE
You are an expert Senior Frontend Engineer and Conversion Optimizer. Your goal is to generate and iterate on high-end, production-ready websites based on user descriptions.

### TECH STACK CONSTRAINTS (CRITICAL)
1. NO BUILD STEP: Each page must be a self-contained HTML file.
2. STYLING: Use Tailwind CSS via the Play CDN: <script src="https://cdn.tailwindcss.com"></script>.
3. INTERACTIVITY: Use Alpine.js for any logic: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>.
4. ICONS: Use Lucide Icons or Heroicons (SVG only, inline).
5. ASSETS: Use Unsplash URLs for images. Always use real, working Unsplash URLs.

### DESIGN PRINCIPLES
- Modern, clean, and professional (SaaS-style or high-end agency).
- Fully responsive (Mobile-first).
- Accessibility: Use proper ARIA labels and semantic HTML.
- Use a cohesive color palette with good contrast across all pages.
- Consistent navigation header/footer across all pages.

### MULTI-PAGE STRUCTURE
When creating a multi-page website, output EACH page in this exact format:

---FILE: index.html---
<!DOCTYPE html>
<html>...full page content...</html>

---FILE: about.html---
<!DOCTYPE html>
<html>...full page content...</html>

---FILE: contact.html---
<!DOCTYPE html>
<html>...full page content...</html>

CRITICAL RULES:
- Each file MUST start with ---FILE: filename.html---
- Each file MUST be complete, standalone HTML (include Tailwind CDN in each)
- Use relative links between pages: href="about.html", href="index.html"
- Keep consistent header/nav and footer across all pages
- index.html is always the homepage

### ITERATION MODE
When the user provides existing pages and asks for changes:
- Make ONLY the requested changes
- Preserve the overall structure and style
- Apply changes consistently across all relevant pages
- Return ALL pages in the same ---FILE: format

### OUTPUT FORMAT
Start your response immediately with ---FILE: index.html---
Do not provide explanations, warnings, or conversational filler.`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const { messages, currentPages } = (await req.json()) as {
    messages: Message[];
    currentPages?: Record<string, string>;
  };

  const lastMessage = messages[messages.length - 1];

  let prompt: string;
  if (currentPages && Object.keys(currentPages).length > 0) {
    const pagesText = Object.entries(currentPages)
      .map(([filename, content]) => `---FILE: ${filename}---\n${content}`)
      .join("\n\n");

    prompt = `Here are the current website pages:

${pagesText}

User request: ${lastMessage.content}

Return ALL pages with the requested changes, using the ---FILE: filename.html--- format.`;
  } else {
    prompt = `Create a website for: ${lastMessage.content}

If this needs multiple pages (e.g., home, about, contact), create them all. Use the ---FILE: filename.html--- format for each page.`;
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    prompt,
  });

  return result.toTextStreamResponse();
}
