# Build 03: HR Policy Chatbot (RAG Pipeline)

This module focuses on building a Knowledge-Based Chatbot capable of answering HR Policy questions by retrieving relevant information from ingested documents using a Retrieval-Augmented Generation (RAG) pipeline.

## 🌟 Goals for Build 03

- **Document Ingestion**: Implement a mechanism to parse and ingest PDF documents.
- **Embedding Optimization**: Generate vector embeddings for the ingested text and store them efficiently using PostgreSQL and `pgvector`.
- **RAG Pipeline**: Use Vector Search to quickly find the best match for a user's query and use an LLM to refine the retrieved context so it fits naturally into the conversation.
- **Strict Guardrails**: Ensure the LLM strictly relies on the provided context, gracefully handling out-of-scope, ambiguous, or multi-part questions.

## 🏗️ Current State

This project has been scaffolded from **Build 02** to maintain a consistent architecture, with the addition of a vector database:
- **Fastify** for the API layer.
- **Pino** for structured logging.
- **Redis** for session memory and rate limiting.
- **Prisma** with **PostgreSQL (`pgvector`)** for persistent vector storage and similarity search.
- **OpenAI** for embedding generation and conversational AI.

## 📝 Prompt Template System

The chatbot uses a robust template system to manage and build system prompts dynamically:

- **Template Storage**: System prompts are stored as `.txt` files in `src/prompts/` (e.g., `rag.system.txt`).
- **Loading & Building**: The `src/utils/prompt-loader.ts` utility handles reading the template from the filesystem and injecting dynamic values into placeholders (e.g., `{{company_name}}`, `{{context}}`).
- **Strict Rules**: The system prompt explicitly dictates grounding, behavior, question clarification, and how to handle out-of-scope or gibberish input.

## 🛡️ Guardrail Layers

To ensure safety, privacy, and reliability, the application implements a multi-layered guardrail system:

### 1. Input Guardrails (Middleware)
- **Rate Limiting**: Prevents abuse by limiting the number of requests per session.
- **Max Length**: Enforces a maximum character limit on user queries.
- **Moderation**: Uses OpenAI's Moderation API to block inappropriate or harmful content.
- **Abuse Check**: Detects and prevents systematic abuse patterns.

### 2. Data Privacy & Security
- **PII Masking**: Automatically detects and masks Personally Identifiable Information (emails, phone numbers) before it reaches the LLM.
- **Leak Detection**: Scans LLM output in real-time for sensitive internal data or system instructions.

### 3. Resource & Output Guardrails
- **Token Usage Limits**: Tracks and enforces a hard limit on total tokens consumed per session.
- **Strict Grounding**: The LLM is explicitly instructed to never guess, to strictly base answers on the provided context, and to refuse answering out-of-scope questions.
- **Unanswered Tracking**: Logs questions that couldn't be answered by the context for manual review and knowledge base improvement.

---

*Part of the AI Training Series.*
