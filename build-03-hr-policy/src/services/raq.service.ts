import { prisma } from "../utils/db.js"
import { containsSensitiveData } from "../utils/leak-check.js"
import { logger } from "../utils/logger.js"
import { buildPrompt, loadPrompt } from "../utils/prompt-loader.js"
import { redis } from "../utils/redis.js"
import { createChatCompletion } from "./openai.service.js"
import { retrievRelevantService } from "./retrieval.service.js"

type Message = {
    role: "user" | "assistant" | "system",
    content: string
}

export const processRAGChat = async (sessionId : string, question : string, correlationId : string, onChunk : (chunk : string) => void) => {
    logger.info({requestId : correlationId}, "Processing RAG chat")

    //* retrive chunks
    const chunks = await retrievRelevantService(question)

    if(!chunks.length){
        onChunk("I could not find this in the document")
        return
    }

    //* build context
    const context = chunks.map((c,i) => `Source ${i + 1} (Page ${c.page}, ${c.section}):\n${c.content}`).join("\n\n")

    //* load + build prompt
    const template = loadPrompt("rag.system.txt")

    const systemPrompt = buildPrompt(template, {
        company_name : "My_Company",
        context
    })

    //* user prompt
    const userPrompt = `User Question: ${question}`

    //* cache data
    let history: Message[] = []

    const cached = await redis.lrange(sessionId, 0, -1)

    if(cached.length > 0){
        history = cached.map((item: string) => JSON.parse(item))
    }
    else{
        const historyFromDB = await prisma.chat.findMany({
            where : {sessionId},
            orderBy : {createdAt : "asc"},
            take : 15
        })

        history = historyFromDB.map( m => ({
            role : m.role as "user" || "assistant",
            content : m.content
        }))
    }

    //* add user message
    history.push({
        role : "user",
        content : userPrompt
    })

    //* message
    const messages: Message[] = [
        {
            role : "system",
            content : systemPrompt
        },
        ...history
    ]

    //* streaming LLM
    let buffer = ""
    let fullResonse = ""
    let blocked = false

    await createChatCompletion(messages, (chunk : string) => {
        if(blocked) return
        buffer += chunk
        fullResonse += chunk

        //* check every 20 character (sensitive data check)
        if(buffer.length > 20){
            if(containsSensitiveData(buffer)){
                blocked = true
                logger.error({requestId : correlationId}, "Sensitive data leak detected")

                onChunk("Sorry, I can't share this information")
                buffer = ""
                return
            }

            onChunk(buffer)
            buffer = ""
        }
    })

    if(!blocked && buffer.length > 0){
        onChunk(buffer)
    }

    //* save message in DB
    const newDate = Date.now()
    await prisma.chat.createMany({
        data : [
            {
                sessionId,
                role : "user",
                content : question,
                createdAt : new Date(newDate - 1)
            },
            {
                sessionId,
                role : "assistant",
                content : fullResonse,
                createdAt : new Date()
            }
        ]
    })

    //* store in redis
    await redis.rpush(
        sessionId,
        JSON.stringify({role : "user", content : question})
    )

    await redis.rpush(
        sessionId,
        JSON.stringify({role : "assistant", content : fullResonse})
    )

    //* keep only last 15 msg
    await redis.ltrim(sessionId, -15, -1)

    //* reset TTL
    await redis.expire(sessionId, 86400)

    //* send source at end
    // onChunk(`\n\nSource:\n${chunks.map((c) => `Page ${c.page} (${c.section})`).join(", ")}`)
}

//! get document service
export const getDoucmentService = async () => {
    const documents = await prisma.document.findMany({
        include : {
            _count : {
                select : {
                    chunks : true
                }
            }
        },
        orderBy : {
            uploadedAt : "desc"
        }
    })

    return documents.map(doc => ({
        id : doc.id,
        filename : doc.filename,
        uploadedAt : doc.uploadedAt,
        chunkCount : doc._count.chunks
    }))
}

//! delete document service
export const deleteDocumentService = async (docId : string) => {
    const existing = await prisma.document.findUnique({
        where : {
            id : docId
        }
    })

    if(!existing){
        throw new Error("Document not exists")
    }

    await prisma.document.delete({
        where : {
            id : docId
        }
    })

    return {
        message : "Document deleted successfully"
    }
}

//! get chat history
export const getChatHistoryService = async ({page, limit, sessionId} : {page : number, limit : number, sessionId : string}) => {

    logger.info({ sessionId }, "DB fetching chat history")

    const skip = (page - 1) * limit

    const [history, total] = await Promise.all([
         prisma.chat.findMany({
            where : {
                sessionId
            },
            orderBy : {
                createdAt : "asc"
            },
            skip,
            take : limit
        }),

        prisma.chat.count({
            where : {
                sessionId
            }
        })
    ])

    return {
        page,
        limit,
        total,
        totalPage : Math.ceil(total / limit),
        message : history
    }
}

//! delete history
export const deleteChatHistoryService = async (sessionId : string) => {
     logger.warn({ sessionId }, "Deleting chat from DB + Redis")

    await prisma.chat.deleteMany({
        where : {
            sessionId
        }
    })

    await redis.del(sessionId)

    return {
        message : "Chat delete successfully"
    }
}