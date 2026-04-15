import type { FastifyInstance } from "fastify";
import { helloRoutes } from "./hello.js";
import {chatRoutes} from "./chat.route.js"


export async function initialRoute(fastify: FastifyInstance) {
  fastify.register(helloRoutes, {prefix:"/hello"})
  fastify.register(chatRoutes, {prefix:"/chat"})
}
