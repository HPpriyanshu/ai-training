import type { FastifyInstance } from "fastify";
import {chatRoutes} from "./chat.route.js"
import { ragRoutes } from "./rag.routes.js";
import { agentRoutes } from "./agent.routes.js";
import mcpRoutes from "./mcp.routes.js";


export async function initialRoute(fastify: FastifyInstance) {
  // fastify.register(chatRoutes, {prefix:"/chat"})
  // fastify.register(ragRoutes, {prefix:"/rag"})
  fastify.register(agentRoutes, {prefix:"/mcp"})
  fastify.register(mcpRoutes, {prefix:"/mcp/server"})
}
