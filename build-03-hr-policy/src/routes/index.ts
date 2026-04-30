import type { FastifyInstance } from "fastify";
import {chatRoutes} from "./chat.route.js"
import { ragRoutes } from "./rag.routes.js";


export async function initialRoute(fastify: FastifyInstance) {
  // fastify.register(chatRoutes, {prefix:"/chat"})
  fastify.register(ragRoutes, {prefix:"/rag"})
}
