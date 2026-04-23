import { FastifyInstance } from "fastify";
import { chatStream, deleteHistoryController, getHistoryController, getUsageController } from "../controllers/chat.controller.js";
import { moderationMiddleware } from "../middleware/moderation.middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import { maxLengthMiddleware } from "../middleware/max-length.middleware.js";
import { piiMaskMiddleware } from "../middleware/pii-mask.middleware.js";
import { abuseCheckMiddleware } from "../middleware/abuse-check.middleware.js";

export async function chatRoutes(fastify: FastifyInstance){
    fastify.post("/", {preHandler : [abuseCheckMiddleware, maxLengthMiddleware, moderationMiddleware, rateLimitMiddleware, piiMaskMiddleware]}, chatStream)
    fastify.get("/get-history/:sessionId", getHistoryController)
    fastify.delete("/delete-history/:sessionId", deleteHistoryController)
    fastify.get("/get-usage/:sessionId", getUsageController)
}