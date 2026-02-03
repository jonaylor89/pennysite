# Pennysite: Analysis & Desktop Architecture

## 1. What is Pennysite?

**Pennysite** is an AI-powered "text-to-website" builder designed for rapid prototyping and publishing. It abstracts away the complexities of web development by allowing users to generate functional, hosted websites through a chat interface.

### Core Functionality
*   **Text-to-Site:** Users describe a website in plain English.
*   **AI Agent Loop:** A specialized agent plans the site, generates HTML/Tailwind/Alpine.js code, and iteratively validates/fixes the output.
*   **Instant Hosting:** Deploys generated sites directly to Cloudflare Pages.
*   **Pay-per-Generation:** Uses a credit-based system (Stripe) for AI resource consumption.

### Technical Foundation
*   **Framework:** Next.js 16 (App Router)
*   **AI Integration:** OpenAI (GPT-4o/5.2) via `@mariozechner/pi-agent-core`.
*   **Persistence:** Supabase (PostgreSQL) for user data and site metadata.
*   **Deployment:** Cloudflare Pages API.

---

## 2. Desktop App: "Pennysite Studio"

If this project evolves into a desktop application, a "genius-level" implementation would move beyond a simple web-wrapper and become a **local-first development environment**.

### The Vision
A professional-grade tool that bridges the gap between AI generation and manual coding. It writes directly to the local filesystem, allowing the AI to act as a "junior developer" working alongside the user's favorite tools (like VS Code).

### Professional Architecture

To achieve this, the codebase would be refactored into a **monorepo** using **Hexagonal Architecture (Ports and Adapters)**.

#### Technology Stack
*   **Runtime:** **Electron** (to reuse the Node.js-based AI agent logic) or **Tauri** (for a lightweight footprint).
*   **Database:** **SQLite** (local) for conversation history and project metadata.
*   **Filesystem:** Direct Node.js `fs` access for real-time file writing.
*   **Preview:** Integrated **Fastify** or **Vite** server for sub-millisecond local previews.

#### Architectural Layers

1.  **The Core (Shared Library)**
    *   Pure TypeScript logic containing the `Agent`, `Prompts`, and `Validators`.
    *   Defines interfaces (Ports) for storage, deployment, and LLM communication.
    *   Remains environment-agnostic (doesn't know if it's on a server or a laptop).

2.  **The Desktop Adapter**
    *   **FileSystem Adapter:** Implements storage by writing `.html` files directly to a folder on the user's disk (e.g., `~/Documents/Websites/my-startup`).
    *   **Deployment Adapter:** Instead of just Cloudflare, it adds `GitDeployer` (auto-committing to GitHub) and `S3Deployer`.
    *   **Local Server Adapter:** Spins up a local port (e.g., `localhost:3000`) that serves the generated files instantly without needing a network round-trip.

3.  **The Multi-Process Model**
    *   **Main Process (Node.js):** Handles the heavy lifting—AI agent orchestration, filesystem watches, and local server management.
    *   **Renderer Process (React):** A sleek, Material Design-inspired UI that handles the chat and real-time code preview.
    *   **IPC Bridge:** Secure communication between the UI and the local system.

### Why this approach?
By building it this way, **Pennysite Studio** becomes an "un-locked" platform. Users aren't trapped in a browser tab; they can prompt the AI to build a page, see it appear in their local folder, and immediately open it in their IDE to add custom logic. It transforms the AI from a site-generator into a **filesystem-aware collaborator**.
