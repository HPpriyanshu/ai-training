import { FastifyReply, FastifyRequest } from "fastify";
import { deleteHistoryService, getAnalyticsService, getHistoryService, getTopicService, getUsageService, processChat, submitFeedbackService } from "../services/chat.service.js";
import { unmaskPII } from "../utils/pii-mask-unmask.js";

type chatBody = {
    message: string,
    sessionId: string
}

type paramsType = {
    sessionId: string,
}

type queryType = {
    page?: string,
    limit?: string
}

type feedBack = {
    question : string,
    answer : string,
    helpful : boolean
}

export const chatStream = async (req: FastifyRequest<{ Body: chatBody }>, reply: FastifyReply) => {
    try {
        const { message, sessionId } = req.body

        if (!message || !sessionId) {
            req.log.warn("Missing message or session Id")

            return reply.code(400).send({
                error: "message & sessionId required"
            })
        }

        //! SSE header
        reply.raw.writeHead(200, {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive"
        })

        req.log.debug("SSE conection established")

        reply.raw.write(`data: ${JSON.stringify({ type: "start" })}\n\n`)

        req.raw.on("close", () => {
            req.log.warn("client disconnected")
        })

        await processChat(sessionId, message, req.id, (chunk: string) => {

            //! unmask PII
            const restore = unmaskPII(chunk, req.piiMap || {})

            reply.raw.write(`data: ${JSON.stringify({ type: "chunk", content: restore })}\n\n`)
        })

        req.log.info("Chat completed successfully")

        reply.raw.write(`data: ${JSON.stringify({ type: "end" })}\n\n`)
        reply.raw.end()
    } catch (error) {
        req.log.error({ error }, "Chat stream error")

        try {
            reply.raw.write(`data: ${JSON.stringify({ type: "error", message: "Something went wrong" })}\n\n`)
            reply.raw.end()
        } catch { }
    }
}

//! get topic
export const getTopicController = async (req : FastifyRequest, reply: FastifyReply) => {
    try {
        const data = await getTopicService()        

        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({error}, "Topic fetch error")
        return reply.code(500).send({error : "Failed to fetch topic"})
    }
}

//! submit feedback
export const submitFeedbackController = async (req : FastifyRequest<{Body : feedBack}>, reply : FastifyReply) => {
    try {
        const {question, answer, helpful} = req.body

        const data = await submitFeedbackService(question, answer, helpful)

        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({error}, "Submit feedback error")
        return reply.code(500).send({error : "Feedback submission error"})
    }
}

//! get analytics
export const getAnalyticsController = async (req : FastifyRequest<{Querystring : {page? : string, limit? : string, helpful?: string}}>, reply : FastifyReply) => {
    try {
        // const page = req.query.page ? Number(req.query.page) :  1
        // const limit = req.query.limit ? Number(req.query.limit) : 10
        // const helpful = req.query.helpful === "true" ? true : req.query.helpful === "false" ? false : undefined

        const {page = '1', limit = '10', helpful} = req.query
        const pageNumber = Number(page)
        const limitNumber = Number(limit)
        const helpfulBool =
            helpful === "true"
            ? true
            : helpful === "false"
            ? false
            : undefined

        const params = {
            page : pageNumber,
            limit : limitNumber,
            ...(helpfulBool !== undefined && { helpful: helpfulBool })
        }    
        
        const data = await getAnalyticsService(params)

        return reply.code(200).send(data)
        
    } catch (error) {
        req.log.error({error}, "Analytics fetch error")
        return reply.code(500).send({error : "Failed to fetch analytics"})
    }
}

//! get history
export const getHistoryController = async (req: FastifyRequest<{ Params: paramsType, Querystring: queryType }>, reply: FastifyReply) => {

    try {

        const sessionId = req.params.sessionId
        const { page = '1', limit = '10' } = req.query

        req.log.info({ sessionId }, "Fetching chat history")

        const data = await getHistoryService({ sessionId, page, limit })

        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({ error }, "History fetch failed")
        return reply.code(500).send({ error: "Failed to fetch history" })
    }
}

//! delete history
export const deleteHistoryController = async (req: FastifyRequest<{ Params: paramsType }>, reply: FastifyReply) => {
    try {
        const sessionId = req.params.sessionId

        const data = await deleteHistoryService(sessionId)

        return reply.send(data)
    } catch (error) {
        req.log.error({ error }, "Delete Failed")
        return reply.code(500).send({ error: "failed to delete chat history" })
    }
}

//! get usage
export const getUsageController = async (req: FastifyRequest<{ Params: paramsType }>, reply: FastifyReply) => {
    try {
        const sessionId = req.params.sessionId

        const data = await getUsageService(sessionId)

        return reply.code(200).send(data)

    } catch (error) {
        req.log.error({ error }, "Usage fetch failed")
        return reply.code(500).send({ error: "Failed to fetch usage" })
    }
}