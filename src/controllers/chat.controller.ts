import { FastifyReply, FastifyRequest } from "fastify";
import { processChat } from "../services/chat.service.js";

type chatBody = {
    message : string,
    sessionId : string
}

export const chatStream = async (req : FastifyRequest<{Body: chatBody}>, reply : FastifyReply) => {
    try {
        const {message, sessionId} = req.body

        if(!message || !sessionId){
            req.log.warn("Missing message or session Id")

            return reply.code(400).send({
                error : "message & sessionId required"
            })
        }

        //! SSE header
        reply.raw.writeHead(200, {
            "content-type" : "text/event-stream",
            "cache-control" : "no-cache",
            connection : "keep-alive"
        })

        req.log.debug("SSE conection established")

        reply.raw.write(`data: ${JSON.stringify({type : "start"})}\n\n`)

        req.raw.on("close", () => {
            req.log.warn("client disconnected")
        })

        await processChat(sessionId, message, req.id, (chunk : string)=>{
            reply.raw.write(`data: ${JSON.stringify({type : "chunk", content : chunk})}\n\n`)
        })

        req.log.info("Chat completed successfully")

        reply.raw.write(`data: ${JSON.stringify({type : "end"})}\n\n`)
        reply.raw.end()
    } catch (error) {
        req.log.error({error}, "Chat stream error")

        try {
            reply.raw.write(`data: ${JSON.stringify({type : "error", message : "Something went wrong"})}\n\n`)
            reply.raw.end()
        } catch{}
    }
}