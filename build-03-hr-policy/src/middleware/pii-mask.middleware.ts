import { FastifyReply, FastifyRequest } from "fastify";
import { maskPII } from "../utils/pii-mask-unmask.js";

declare module "fastify" {
    interface FastifyRequest {
        piiMap? : Record<string, string>
    }
}

export const  piiMaskMiddleware = async(req: FastifyRequest<{Body : {question: string}}>, reply : FastifyReply) => {
    const {question} = req.body

    const {text, map} = maskPII(question)

    req.body.question = text

    req.piiMap = map
}