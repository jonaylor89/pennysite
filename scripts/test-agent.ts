#!/usr/bin/env npx tsx

/**
 * CLI script to test the website generation agent directly.
 *
 * Usage:
 *   npx tsx scripts/test-agent.ts "Create a landing page for a coffee shop"
 *   npx tsx scripts/test-agent.ts --prompt "Create a SaaS landing page" --output ./output
 */

import * as fs from "node:fs";
import * as path from "node:path";

import * as dotenv from "dotenv";
import { generateWebsite } from "../src/lib/generation/agent";

dotenv.config({ path: ".env.local" });

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let prompt = "";
  let outputDir = "./test-output";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prompt" && args[i + 1]) {
      prompt = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      prompt = args[i];
    }
  }

  if (!prompt) {
    console.log('Usage: npx tsx scripts/test-agent.ts "Your prompt here"');
    console.log(
      '       npx tsx scripts/test-agent.ts --prompt "Your prompt" --output ./output',
    );
    process.exit(1);
  }

  // Check for API key
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  console.log("=== Agent Test ===");
  console.log(`Prompt: ${prompt}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`API Key: OpenAI=${hasOpenAIKey}`);
  console.log("");

  if (!hasOpenAIKey) {
    console.error("ERROR: No API key found. Set OPENAI_API_KEY");
    process.exit(1);
  }

  console.log("Starting generation...\n");

  const startTime = Date.now();
  let eventCount = 0;
  let pages: Record<string, string> = {};

  try {
    for await (const event of generateWebsite(prompt)) {
      eventCount++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      switch (event.type) {
        case "status":
          console.log(`[${elapsed}s] STATUS: ${event.message}`);
          break;

        case "spec":
          console.log(
            `[${elapsed}s] SPEC: Created plan for "${event.spec.name}"`,
          );
          console.log(
            `        Pages: ${event.spec.pages.map((p: { filename: string }) => p.filename).join(", ")}`,
          );
          break;

        case "page":
          pages[event.filename] = event.html;
          console.log(
            `[${elapsed}s] PAGE: Generated ${event.filename} (${event.html.length} chars)`,
          );
          break;

        case "thinking":
          console.log(
            `[${elapsed}s] THINKING: ${event.content.substring(0, 100)}...`,
          );
          break;

        case "usage":
          console.log(
            `[${elapsed}s] USAGE: ${event.usage.inputTokens} in, ${event.usage.outputTokens} out`,
          );
          break;

        case "complete":
          pages = event.pages;
          console.log(`\n[${elapsed}s] COMPLETE!`);
          console.log(`        Pages: ${Object.keys(event.pages).join(", ")}`);
          console.log(
            `        Tokens: ${event.usage.inputTokens} in, ${event.usage.outputTokens} out`,
          );
          break;

        case "error":
          console.error(`\n[${elapsed}s] ERROR: ${event.error}`);
          if (event.usage) {
            console.error(
              `        Tokens used: ${event.usage.inputTokens} in, ${event.usage.outputTokens} out`,
            );
          }
          break;
      }
    }
  } catch (err) {
    console.error("\nFATAL ERROR:", err);
    process.exit(1);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Summary ===`);
  console.log(`Total time: ${totalTime}s`);
  console.log(`Events: ${eventCount}`);
  console.log(`Pages generated: ${Object.keys(pages).length}`);

  // Save output if pages were generated
  if (Object.keys(pages).length > 0) {
    fs.mkdirSync(outputDir, { recursive: true });

    for (const [filename, html] of Object.entries(pages)) {
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, html);
      console.log(`Saved: ${filePath}`);
    }

    console.log(
      `\nOpen in browser: file://${path.resolve(outputDir)}/index.html`,
    );
  } else {
    console.log("\nNo pages were generated.");
    process.exit(1);
  }
}

main().catch(console.error);
