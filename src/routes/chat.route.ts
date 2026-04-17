import { FastifyInstance } from "fastify";
import { chatStream, deleteHistoryController, getHistoryController, getUsageController } from "../controllers/chat.controller.js";

export async function chatRoutes(fastify: FastifyInstance){
    fastify.post("/", chatStream)
    fastify.get("/get-history/:sessionId", getHistoryController)
    fastify.delete("/delete-history/:sessionId", deleteHistoryController)
    fastify.get("/get-usage/:sessionId", getUsageController)
}