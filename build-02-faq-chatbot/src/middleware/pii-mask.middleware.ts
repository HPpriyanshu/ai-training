import { FastifyReply, FastifyRequest } from "fastify";
import { maskPII } from "../utils/pii-mask-unmask.js";

declare module "fastify" {
    interface FastifyRequest {
        piiMap? : Record<string, string>
    }
}

export const  piiMaskMiddleware = async(req: FastifyRequest<{Body : {message: string}}>, reply : FastifyReply) => {
    const {message} = req.body

    const {text, map} = maskPII(message)

    req.body.message = text

    req.piiMap = map
}