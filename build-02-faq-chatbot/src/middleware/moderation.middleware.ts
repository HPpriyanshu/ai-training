import { FastifyReply, FastifyRequest } from "fastify";
import { moderateInput } from "../services/moderation.service.js";
import { redis } from "../utils/redis.js";

export const moderationMiddleware = async (req : FastifyRequest<{Body : {message : string, sessionId : string}}>, reply : FastifyReply) => {
    const {message, sessionId} = req.body

    const moderation = await moderateInput(message)

    if(moderation?.flagged){
        await redis.incr(`abuse:${sessionId}`)
        await redis.expire(`abuse:${sessionId}`, 3600)
        
        req.log.warn({moderation}, "Blocked unsafe user input")

        return reply.code(400).send({
            error : "Sorry, your message violates our usage policies. Please try a different question."
        })
    }
}