import { FastifyInstance } from "fastify";
import { deleteChatHistory, deleteDocumentController, getChatHistoryController, getDocumentController, ingestDocument, ragChatStream } from "../controllers/rag.controller.js";
import { abuseCheckMiddleware } from "../middleware/abuse-check.middleware.js";
import { maxLengthMiddleware } from "../middleware/max-length.middleware.js";
import { moderationMiddleware } from "../middleware/moderation.middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import { piiMaskMiddleware } from "../middleware/pii-mask.middleware.js";

export async function ragRoutes(fastify : FastifyInstance){
    fastify.post("/ingest", ingestDocument)
    fastify.post("/chat", {preHandler : [abuseCheckMiddleware, maxLengthMiddleware, moderationMiddleware, rateLimitMiddleware, piiMaskMiddleware]}, ragChatStream)
    fastify.get("/get-document", getDocumentController)
    fastify.delete("/delete-document/:docId", deleteDocumentController)
    fastify.get("/get-history/:sessionId", getChatHistoryController)
    fastify.delete("/delete-history/:sessionId", deleteChatHistory)
}