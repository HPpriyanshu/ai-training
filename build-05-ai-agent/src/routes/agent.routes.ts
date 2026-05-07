import { FastifyInstance } from "fastify";
import { abuseCheckMiddleware } from "../middleware/abuse-check.middleware";
import { maxLengthMiddleware } from "../middleware/max-length.middleware";
import { moderationMiddleware } from "../middleware/moderation.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";
import { piiMaskMiddleware } from "../middleware/pii-mask.middleware";
import { getSessionLogsController, getTool, processAgentChatController } from "../controllers/agent.controller";

export async function agentRoutes(fastify : FastifyInstance){
    fastify.post("/chat", {preHandler : [abuseCheckMiddleware, maxLengthMiddleware, moderationMiddleware, rateLimitMiddleware, piiMaskMiddleware]}, processAgentChatController)
    fastify.get("/tool", getTool)
    fastify.get("/logs/:sessionId", getSessionLogsController)
}