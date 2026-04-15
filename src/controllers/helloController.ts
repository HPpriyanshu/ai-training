import type { FastifyRequest, FastifyReply } from "fastify";
import { getHelloMessage } from "../services/helloService.js";

/**
 * Hello Controller
 * Handles incoming requests for the hello API.
 */
export const helloController = async (request: FastifyRequest, reply: FastifyReply) => {
  request.log.info({ context: "controller", action: "handling_hello_request" }, "HelloController: Handling GET /hello request");
  
  try {
    const data = await getHelloMessage(request.log);
    
    request.log.info({ context: "controller", status: "success" }, "HelloController: Successfully retrieved hello message");
    return reply.status(200).send(data);
  } catch (error) {
    request.log.error({ context: "controller", error }, "HelloController: Error occurred while handling hello request");
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
