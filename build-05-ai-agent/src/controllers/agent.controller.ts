import { FastifyReply, FastifyRequest } from "fastify";
import { getSessionLogs, getToolService, processAgentChat } from "../services/agent.service";
import { unmaskPII } from "../utils/pii-mask-unmask";

export const processAgentChatController = async (req : FastifyRequest<{Body : {question : string, sessionId : string}}>, reply : FastifyReply) => {
    try {
        const {question, sessionId} = req.body

        if(!question || !sessionId){
            req.log.warn("Missing message or sessionId")
            return reply.code(400).send({error : "Question and sessionId is required"})
        }

        //* SSE headers
        reply.raw.writeHead(200, {
            "content-type" : "text/event-stream",
            "cache-control" : "no-cache",
            connection : "keep-alive"
        })

        req.log.debug("SSE connection established")

        reply.raw.write(`data: ${JSON.stringify({type : "start"})}\n\n`)

        await processAgentChat(sessionId, question, req.id, (chunk: string) => {
            //* unMask PII
            const restore = unmaskPII(chunk, req.piiMap || {})

            reply.raw.write(`data: ${JSON.stringify({type : "chunk", content : restore})}\n\n`)
        })

        reply.raw.write(`data: ${JSON.stringify({type : "end"})}\n\n`)
        reply.raw.end()
    } catch (error) {
       if (error instanceof Error) {
            req.log.error({error: error.message,stack: error.stack},"Agent chat error")
        } else {
            req.log.error({error: String(error)},"Agent chat error")
        }
         reply.raw.write(`data: ${JSON.stringify({type : "error", message : "Something went wrong"})}\n\n`)

        reply.raw.end()
    }
}

//! get tool
export const getTool = async (req : FastifyRequest, reply : FastifyReply) => {
    try {
       const data =  await getToolService()

       return reply.code(200).send(data)

    } catch (error) {
        req.log.error({error}, "Tool fetch error")
        return reply.code(500).send({error})
    }
}

//! logs
export const getSessionLogsController = async (req : FastifyRequest<{Params : {sessionId : string}}>, reply : FastifyReply) => {
    try {
        const {sessionId} = req.params

        const data = await getSessionLogs(sessionId)

        return reply.code(200).send(data)

    } catch (error) {
        req.log.error({error}, "Error fetching session logs")
        return reply.code(500).send({error})
    }
}