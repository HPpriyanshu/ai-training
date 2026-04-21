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

## 🚀 How to Transition

1.  **Define FAQs**: Create a source of truth for your questions and answers (JSON or Database).
2.  **Implement Search**: Create a service to find the most relevant FAQ entry based on the user's message.
3.  **Update Prompting**: Adjust the system prompt to instruct the LLM to use the provided FAQ context to answer.

---

*Part of the AI Training Series.*
