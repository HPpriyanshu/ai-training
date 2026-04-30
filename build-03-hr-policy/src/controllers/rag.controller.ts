import { FastifyReply, FastifyRequest } from "fastify";
import { processDocument } from "../services/ingestion.service.js";
import { deleteChatHistoryService, deleteDocumentService, getChatHistoryService, getDoucmentService, processRAGChat } from "../services/raq.service.js";
import { unmaskPII } from "../utils/pii-mask-unmask.js";

type queryType = {
    page : string,
    limit : string
}

type paramType = {
    sessionId : string
}

export const ingestDocument = async (req : FastifyRequest, reply : FastifyReply) => {
    try {
        req.log.info("Incoming document ingestion request")        

        const file = await req.file()
        if(!file){
            req.log.warn("No file uploaded")

            return reply.code(400).send({error : "No file uploaded"})
        }

        req.log.info({filename : file.filename, mimetype : file.mimetype}, "File received")

        const buffer = await file.toBuffer()

        const result = await processDocument({buffer, mimetype : file.mimetype, filename : file.filename})

        req.log.info({filename :result.filename, chunks : result.totalChunks}, "Document processed successfully")

        return reply.code(200).send(result)
    } catch (error) {
        req.log.error({error}, "Ingestion failed")
        return reply.code(500).send({error})
    }
}

export const ragChatStream = async (req : FastifyRequest<{Body : {question : string, sessionId : string}}>, reply : FastifyReply) => {
    try {
        const {question, sessionId} = req.body

        if(!question || !sessionId){
            req.log.warn("Missing message or sessionId")
            return reply.code(400).send({error : "Question & SessionId required"})
        }

        //! SSE headers
        reply.raw.writeHead(200, {
            "content-type" : "text/event-stream",
            "cache-control" : "no-cache",
            connection : "keep-alive"
        })

        req.log.debug("SSE conection established")

        reply.raw.write(`data: ${JSON.stringify({type : "start"})}\n\n`)

        await processRAGChat(sessionId, question, req.id, (chunk : string) => {
            //* un-mask PII
            const restore = unmaskPII(chunk, req.piiMap || {})

            reply.raw.write(`data: ${JSON.stringify({type : "chunk", content : restore})}\n\n`)
        })

        reply.raw.write(`data: ${JSON.stringify({type : "end"})}\n\n`)
        reply.raw.end()
    } catch (error) {
        req.log.error({error}, "RAG stream error")

        reply.raw.write(`data: ${JSON.stringify({type : "error", message : "Something went wrong"})}\n\n`)

        reply.raw.end()
    }
}

//! get doucment controller
export const getDocumentController = async (req : FastifyRequest, reply : FastifyReply) => {
    try {
        const result = await getDoucmentService()

        return reply.code(200).send(result)
    } catch (error) {
        req.log.error({error}, "Document fetch error")
       return reply.code(500).send({error})
    }
}

//! delete document
export const deleteDocumentController = async (req : FastifyRequest<{Params : {docId : string}}>, reply : FastifyReply)=> {
    try {
        const {docId} = req.params

        const result = await deleteDocumentService(docId)

        return reply.code(200).send(result)
    } catch (error) {
        req.log.error({error}, "Document delete error")
        return reply.code(500).send(error)
    }
}

//! get history
export const getChatHistoryController = async (req : FastifyRequest<{Querystring : queryType, Params : paramType}>, reply : FastifyReply) => {
    try {
        const {sessionId} = req.params        
        const {page = '1', limit = '10'} = req.query

        const pageNumber = parseInt(page)
        const limitNumber = parseInt(limit)

        const params = {
            page : pageNumber,
            limit : limitNumber,
            sessionId
        }

        const result = await getChatHistoryService(params)

        return reply.code(200).send(result)
    } catch (error) {
        req.log.error({error}, "History fetch error")
        return reply.code(500).send(error)
    }
}

//! delete history
export const deleteChatHistory = async (req : FastifyRequest<{Params : {sessionId : string}}>, reply : FastifyReply) => {
    try {
        const  sessionId = req.params.sessionId

        const data = await deleteChatHistoryService(sessionId)

        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({error}, "History delete failed")
        return reply.code(500).send(error)
    }
}