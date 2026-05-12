import { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../utils/redis.js";

export const abuseCheckMiddleware = async (req : FastifyRequest<{Body : {sessionId : string}}>, reply : FastifyReply) => {
    const {sessionId} = req.body

    const abuseKey = `abuse:${sessionId}`
    const count = await redis.get(abuseKey)
    const abuseCount = count ? parseInt(count) : 0

    if(abuseCount >=5) {
        const ttl = await redis.ttl(`abuse:${sessionId}`)
        const hours = Math.floor(ttl / 3600)
        const minutes = Math.floor((ttl % 3600) / 60)

        return reply.code(403).send({error : `You are temporary blocked due to repeatedly violation. Try again after ${hours}h ${minutes}m`})
    }

    if(abuseCount >=3){
        return reply.code(404).send({error : "Too many violations. Please wait before trying again"})
    }
}