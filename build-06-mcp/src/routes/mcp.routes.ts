import { FastifyInstance } from "fastify";
import { getMcpStatus } from "../controllers/mcp.controller.js";

export default async function mcpRoutes(fastify: FastifyInstance) {
    fastify.get("/status", getMcpStatus);
}
