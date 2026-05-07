import { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../utils/redis.js";

export const rateLimitMiddleware = async (req : FastifyRequest<{Body : {sessionId : string}}>, reply : FastifyReply) => {
    const {sessionId} = req.body

    const chatLimitKey = `chat_limit${sessionId}`

    const currentCode = await redis.incr(chatLimitKey)

    if(currentCode == 1){
        await redis.expire(chatLimitKey, 86400)
    }

    const DAILY_LIMIT = 150

    if(currentCode > DAILY_LIMIT){
        await redis.incr(`abuse:${sessionId}`)
        await redis.expire(`abuse:${sessionId}`, 3600)

        const ttl = await redis.ttl(chatLimitKey)

        const hours = Math.floor(ttl / 3600)
        const minutes = Math.floor((ttl % 3600) / 60)

        req.log.warn({sessionId, currentCode, ttl}, "Daily chat limit exceed")

        return reply.code(429).send({
            error : `Daily limit exceeded. Try again in ${hours}h ${minutes}m`
        })
    }
}