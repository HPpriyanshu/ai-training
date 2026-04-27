# Build 02: FAQ Chatbot

This module focuses on building a Knowledge-Based Chatbot capable of answering Frequently Asked Questions (FAQs) by retrieving relevant information from a pre-defined source.

## 🌟 Goals for Build 02

- **Knowledge Retrieval**: Implement a mechanism to search through a collection of FAQ entries.
- **Contextual Responses**: Use an LLM to refine the retrieved FAQ answer so it fits naturally into the conversation.
- **Efficient Lookup**: Use Redis or a Database to quickly find the best match for a user's query.

## 🏗️ Current State

This project has been scaffolded from **Build 01** to maintain a consistent architecture:
- **Fastify** for the API layer.
- **Pino** for structured logging.
- **Redis** for session memory and rate limiting.
- **Prisma** for persistent storage.

## 📝 Prompt Template System

The chatbot uses a robust template system to manage and build system prompts dynamically:

- **Template Storage**: System prompts are stored as `.txt` files in `src/prompts/` (e.g., `faq.system.txt`).
- **Loading & Building**: The `src/utils/prompt-loader.ts` utility handles:
    - `loadPrompt(fileName)`: Reads the template from the filesystem with an internal cache for performance.
    - `buildPrompt(template, variables)`: Injects dynamic values into placeholders (e.g., `{{faq_content}}`, `{{company_name}}`).
- **FAQ Content**: The `formatFaq()` utility generates a structured representation of the FAQ data to be injected into the system prompt.

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
- **Strict Formatting**: Ensures the assistant follows specific behavior rules (e.g., never guessing, rephrasing answers).
- **Unanswered Tracking**: Logs questions that couldn't be answered by the FAQ for manual review and knowledge base improvement.


## 🚀 How to Transition

1.  **Define FAQs**: Create a source of truth for your questions and answers (JSON or Database).
2.  **Implement Search**: Create a service to find the most relevant FAQ entry based on the user's message.
3.  **Update Prompting**: Adjust the system prompt to instruct the LLM to use the provided FAQ context to answer.

---

*Part of the AI Training Series.*
