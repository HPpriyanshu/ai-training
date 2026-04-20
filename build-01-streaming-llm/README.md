# Build 01: Streaming LLM with Fastify & Redis

This module demonstrates how to build a high-performance, real-time chat interface using **Server-Sent Events (SSE)**, **Redis caching**, and **Prisma** for persistent storage.

## 🌟 Key Features

- **Real-Time Streaming**: Uses SSE to stream LLM responses chunk-by-chunk for a responsive user experience.
- **Multi-Tiered Memory**:
  - **L1 (Redis)**: Lightning-fast cache for the last 15 messages in a session.
  - **L2 (PostgreSQL)**: Permanent storage for full conversation history audit.
- **Token Management**: Integrated **Tiktoken** for real-time input/output token counting and tracking.
- **Rate Limiting**: Daily chat limits enforced via Redis to manage costs and API usage.
- **Structured Logging**: Production-grade logs using **Pino** with sensitive field redaction.

## 🏗️ Technical Stack

- **Framework**: [Fastify](https://www.fastify.io/) (High-performance web framework)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis (via ioredis)
- **AI**: OpenAI / Groq (via OpenAI SDK)
- **Logger**: Pino

## 🚀 How to Run

### 1. Prerequisites
Ensure you have Docker running for the database and cache.

### 2. Environment Setup
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
Required keys:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_HOST` / `REDIS_PORT`: Redis coordinates.
- `OPENAI_KEY`: Your OpenAI or Groq API Key.

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma migrate dev
```

### 5. Start Development
```bash
npm run dev
```

## 🔌 API Endpoints

### `POST /api/v1/chat`
Starts a streaming chat session.
- **Body**: `{ "message": "hello", "sessionId": "user-123" }`
- **Output**: `text/event-stream`

### `GET /api/v1/chat/get-history/:sessionId`
Fetches conversation history for a specific session (paginated).

### `GET /api/v1/chat/get-usage/:sessionId`
Returns total tokens used by the session against the daily limit.

### `DELETE /api/v1/chat/delete-history/:sessionId`
Clears conversation history from both Redis and the Database.

---

*Part of the AI Training Series.*
