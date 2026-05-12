# Build 05: AI Agent with Tool Calling (Basic)

This module focuses on building an AI Agent capable of interacting with external systems and databases using **Tool Calling** (also known as Function Calling). Unlike a standard chatbot that relies solely on pre-existing knowledge or retrieved text (RAG), this agent can take active actions—fetching real-time data or creating records—to solve user queries.

## 🤖 What is an AI Agent?

An **AI Agent** is an artificial intelligence system that can perceive its environment, make decisions, and take actions to achieve a specific goal. In the context of LLMs, an agent goes beyond generating text; it acts as an intelligent orchestrator that can break down a user's request, determine which external tools or APIs it needs to fulfill the request, execute those tools, and synthesize the results into a cohesive response.

## 🛠️ What is Tool Calling?

**Tool Calling** (or Function Calling) is the mechanism that empowers an AI Agent to interact with the outside world.
Instead of the LLM guessing an answer or saying "I don't have access to real-time data", we define a set of specific functions (tools) the LLM can use.
When the user asks a question, the LLM determines if a tool is needed. If so, it responds with the *intention* to call a tool, along with the required arguments. The application executes the tool (e.g., querying a database or an API) and feeds the result back to the LLM to generate the final answer.

## 🌟 Goals for Build 05

- **Understand Agentic Workflows**: Learn how to transition from a passive chatbot to an active, goal-oriented agent.
- **Implement Tool Calling**: Define structured tools using OpenAI's function calling schema.
- **Action Execution**: Safely execute functions in the backend based on the LLM's requests.
- **Multi-Step Reasoning**: Enable the LLM to call multiple tools sequentially or in parallel to solve complex queries.

## 🏗️ Available Tools in this Build

This agent is equipped with several tools to manage customer support workflows:

- `search_customers`: Search for a customer by name or email.
- `get_order_status`: Check the status of a specific order.
- `get_customer_orders`: Retrieve all orders for a specific customer.
- `create_support_ticket`: Create a new support ticket (Requires confirmation for safety).
- `get_single_support_ticket`: Fetch details of a specific support ticket.
- `get_support_tickets`: Retrieve all support tickets for a specific customer.

## 🚀 Tech Stack

- **Fastify** for the API layer.
- **OpenAI API** for the LLM and tool calling orchestration.
- **TypeScript** for type-safe tool definitions and execution.

---

*Part of the AI Training Series.*
