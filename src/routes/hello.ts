import type { FastifyInstance } from "fastify";
import { helloController } from "../controllers/helloController.js";


export async function helloRoutes(fastify: FastifyInstance) {
  fastify.get("/", helloController);
}
