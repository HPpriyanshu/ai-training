import { FastifyInstance } from "fastify";
import { chatStream } from "../controllers/chat.controller.js";

export async function chatRoutes(fastify: FastifyInstance){
    fastify.post("/", chatStream)
}