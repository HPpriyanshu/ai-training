# AI Training Series: Mastery of LLM & Agentic Workflows

Welcome to the **AI Training Series**. This repository is designed as a structured learning path for building production-grade AI applications using modern, high-performance backends.

## 🏗️ Project Architecture

This repository is structured as a collection of **Independent Projects**. Each folder starting with `build-` is a self-contained lab with its own configuration, dependencies, and environment.

### Why this structure?
- **Isolation**: Each lab can be run, tested, and deployed independently.
- **Progression**: Follow the sequence from `01` to `06` to build increasingly complex systems.
- **Template-Based**: Every lab follows a standardized architecture for production readiness.

## 📁 Roadmap

| Build | Module Name | Focus Area |
| :--- | :--- | :--- |
| **01** | [Streaming LLM](./build-01-streaming-llm) | Server-Sent Events (SSE), Redis Caching, Stream Buffering. |
| **02** | [FAQ Chatbot](./build-02-faq-chatbot) | System Prompt Engineering, Static Context Injection. |
| **03** | [HR Policy RAG](./build-03-hr-policy) | Complex Document Processing, PDF Parsing, Embedding Optimization. |
| **05** | [AI Agent (Basic)](./build-05-ai-agent) | Introduction to Tool Calling, Multi-step reasoning, Action Execution. |
| **06** | [Modular MCP Agent](./build-06-mcp) | Model Context Protocol (MCP), Modular MCP Servers, Client Management. |

## 🛠️ Global Prerequisites

Before starting any lab, ensure you have the following installed:
1.  **Node.js** (v20+ recommended)
2.  **Docker Desktop** (Required for Redis and PostgreSQL)
3.  **tsx** or **nodemon** (for local development)
4.  **Prisma CLI** (`npx prisma`)

## 🚀 Getting Started

1.  Clone this repository.
2.  Choose a build folder (e.g., `cd build-01-streaming-llm`).
3.  Copy `.env.example` to `.env` and fill in your API keys.
4.  Install dependencies: `npm install`.
5.  Run the development server: `npm run dev`.

---

*Part of the AI Training Series.*
