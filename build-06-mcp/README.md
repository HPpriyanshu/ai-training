# Build 06: Modular MCP Architecture (Tool Calling + MCP)

This module advances the AI Agent by introducing the **Model Context Protocol (MCP)** and a highly modular, multi-server architecture. Instead of a monolithic agent, this build demonstrates how to scale an AI system by separating tools and data into independent, pluggable MCP servers.

## 🤖 What is Model Context Protocol (MCP)?

**Model Context Protocol (MCP)** is an open standard that enables AI models to seamlessly connect to data and tools across different services and servers. It provides a standardized way for "Clients" (like our main application) to talk to "Servers" (which host the tools and data) over a unified protocol.

In this build, we transition from hardcoded tools to a **Modular MCP Architecture**, allowing for independent scaling and management of different domains (e.g., CRM, Support, Inventory).

## 🏗️ Folder Structure & Architecture

We have implemented a clean separation of concerns using the following modular structure:

```text
src/
├── mcp/
│   ├── client/           # Central Client Manager, Tool Registry, and Routing
│   │   ├── client-manager.service.ts
│   │   ├── tool-registry.service.ts
│   │   └── tool-router.service.ts
│   │
│   └── crm/              # Modular CRM MCP Server
│       ├── tools/        # Tool definitions (JSON Schemas)
│       ├── handlers/     # Business logic for tool execution
│       ├── registry/     # Tool and Handler registries
│       └── server.ts     # The MCP Server entry point
│
├── controllers/          # Fastify Controllers
├── routes/               # API Routing (Agent & MCP Status)
└── services/             # Core Agent and OpenAI integration
```

## 🛠️ Key Components

### 1. Client Manager (`src/mcp/client/`)
The **Client Manager** is the heart of the system. It:
- Manages multiple background MCP server processes.
- Dynamically connects to servers via `StdioClientTransport`.
- Aggregates tools from **all** connected servers into a single registry for the AI.
- Routes tool calls to the correct server based on the requested tool name.

### 2. CRM MCP Server (`src/mcp/crm/`)
An independent server that follows the MCP standard. It encapsulates all CRM-related tools (`lookup_customer`, `get-orders`) and their handlers. Because it's a separate server, it can be tested, deployed, and scaled independently of the main agent.

## 🚀 Goals for Build 06

- **Master MCP Fundamentals**: Learn how to use the `@modelcontextprotocol/sdk` to build servers and clients.
- **Implement Multi-Server Routing**: Connect and coordinate multiple MCP servers within a single agent session.
- **Modularize Tools**: Transition from a flat tool structure to domain-specific modular servers.
- **Dynamic Discovery**: Enable the AI to automatically discover and use tools as servers are connected.

## 🛠️ Available Tools (CRM Server)

- `lookup_customer`: Search for customer details by name, email, or ID.
- `get-orders`: Retrieve all orders for a specific customer.

## 🚀 Tech Stack

- **Fastify**: High-performance web framework for the API layer.
- **OpenAI API**: For LLM orchestration and intelligent tool calling.
- **Prisma**: For persistent storage of chat history and logs.
- **@modelcontextprotocol/sdk**: The official SDK for building MCP clients and servers.
- **TypeScript**: For type-safe development across the modular architecture.

---

*Part of the AI Training Series.*
