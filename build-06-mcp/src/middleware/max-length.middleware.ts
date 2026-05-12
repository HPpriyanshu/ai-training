import { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../utils/redis.js";

export const maxLengthMiddleware = async (req : FastifyRequest<{Body : {question : string, sessionId : string}}>, reply : FastifyReply) => {

    const {question, sessionId} = req.body

    const MAX_LENGTH = 5000

    if(!question || typeof question !== "string"){
        return reply.code(400).send({error : "Invalid message"})
    }

    if(question.length > MAX_LENGTH){
        await redis.incr(`abuse:${sessionId}`)
        await redis.expire(`abuse:${sessionId}`, 3600)
        
        req.log.warn({length : question.length}, "Message too long")

        return reply.code(400).send({error : `Message too long. Max allowed is ${MAX_LENGTH} characters`})
    }
}