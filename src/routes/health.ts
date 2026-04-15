import type { FastifyInstance } from "fastify";

/**
 * Health Check Route
 * GET /health.
 */
export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return { 
      status: "ok", 
      uptime: process.uptime(),
    };
  });
}
