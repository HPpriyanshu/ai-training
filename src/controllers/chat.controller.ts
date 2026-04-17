import { FastifyReply, FastifyRequest } from "fastify";
import { deleteHistoryService, getHistoryService, getUsageService, processChat } from "../services/chat.service.js";

type chatBody = {
    message : string,
    sessionId : string
}

type paramsType = {
    sessionId : string,
}

type queryType = {
    page? : string,
    limit?: string
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

//! get history
export const getHistoryController = async (req : FastifyRequest<{Params : paramsType, Querystring : queryType}>, reply : FastifyReply) => {

    try {
        
        const sessionId = req.params.sessionId
        console.log(req.params, "        paramssss")
        console.log(sessionId, "     reydecjoiewvehebfduehihe")
        const {page = '1', limit = '10'} = req.query
    
        req.log.info({sessionId}, "Fetching chat history")
    
        const data = await getHistoryService({sessionId, page, limit})
    
        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({error}, "History fetch failed")
        return reply.code(500).send({error : "Failed to fetch history"})
    }
}

//! delete history
export const deleteHistoryController = async (req: FastifyRequest<{Params : paramsType}>, reply : FastifyReply) => {
    try {
        const sessionId = req.params.sessionId

        const data = await deleteHistoryService(sessionId)

        return reply.send(data)
    } catch (error) {
        req.log.error({error}, "Delete Failed")
        return reply.code(500).send({error : "failed to delete chat history"})
    }
}

//! get usage
export const getUsageController = async (req : FastifyRequest<{Params : paramsType}>, reply : FastifyReply) => {
    try {
        const sessionId = req.params.sessionId

        const data = await getUsageService(sessionId)

        return reply.code(200).send(data)

    } catch (error) {
        req.log.error({error}, "Usage fetch failed")
        return reply.code(500).send({error : "Failed to fetch usage"})
    }
}