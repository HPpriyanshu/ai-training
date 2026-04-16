import type { FastifyInstance } from "fastify";
import {chatRoutes} from "./chat.route.js"


export async function initialRoute(fastify: FastifyInstance) {
  fastify.register(chatRoutes, {prefix:"/chat"})
}
