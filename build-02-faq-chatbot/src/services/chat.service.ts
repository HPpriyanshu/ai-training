import { logger } from "../utils/logger.js"
import { redis } from "../utils/redis.js"
import { streamLLM } from "./openai.service.js"
import { countTokens } from "../utils/tokenizer.js"
import { prisma } from "../utils/db.js"
import { buildPrompt, loadPrompt } from "../utils/prompt-loader.js"
import { FAQs } from "../data/faq.js"
import { containsSensitiveData } from "../utils/leak-check.js"
import { formatFaq } from "../utils/faq-formatter.js"

type Message = {
    role: "user" | "assistant" | "system",
    content: string
}

type GetHistoryInput = {
    sessionId: string,
    page: string,
    limit: string
}

export const processChat = async (sessionId: string, message: string, correlationId: string, onChunk: (chunk: string) => void) => {

    logger.info({ requestId: correlationId }, "Processing chat");

    
    //! load system prompt
    const systemTemplate = loadPrompt("faq.system.txt")
    
    const systemPrompt = buildPrompt(systemTemplate, {
        company_name : "My Company",
        faq_content: formatFaq()
    })
    
    //! enrich user prompt
    const userPrompt = `Answer using only the FAQ provider. User Question: ${message}`
    
    //! cache data (redis)
    let history: Message[] = []

    const cached = await redis.lrange(sessionId, 0, -1)

    if (cached.length > 0) {
        history = cached.map((item: string) => JSON.parse(item))
    }
    else {
        //! fallback to db
        const historyFromDb = await prisma.chat.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
            take: 15
        })

        history = historyFromDb.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }))
    }

    //! count input token
    const inputText = [...history, { role: "user", content: message }].map(m => m.content).join(" ")
    const inputTokens = countTokens(inputText)

    logger.info({ requestId: correlationId, inputTokens }, "Input tokens")

    //! Token limit check (before LLM call)
    const usageKey = `usage:${sessionId}`
    const existingUsage = await redis.get(usageKey)
    const usedTokens = existingUsage ? parseInt(existingUsage) : 0

    const MAX_TOKENS = 100000

    if (usedTokens + inputTokens > MAX_TOKENS) {
        throw new Error("Token Limit Exceed")
    }

    //! Add user message
    history.push({
        role: "user",
        content: userPrompt
    })

    let fullResponse = ""
    let buffer = ""
    let blocked = false

    //! add system prompt to llm input
    const finalMessage: Message[] = [
        {
            role : "system",
            content : systemPrompt
        },
        ...history
    ]

    //! call openai service
    await streamLLM(finalMessage, (chunk: string) => {
        if(blocked) return
        fullResponse += chunk
        buffer += chunk

        //? check every 20 character (sensitive data check)
        if(buffer.length > 20){

            if(containsSensitiveData(buffer)){
                blocked = true
                logger.error({requestId : correlationId}, "Sensitive data leak detected")

                onChunk("Sorry, I can't share that information")
                buffer = ""
                return
            }

            onChunk(buffer)
            buffer = ""
        }
    })
    if(!blocked && buffer.length> 0){
        onChunk(buffer)
    }

    //! count output token
    const outputTokens = countTokens(fullResponse)

    logger.info({ requestId: correlationId, outputTokens }, "Output tokens")

    //! total usage update (after LLM call)
    const totalTokens = inputTokens + outputTokens

    const existingUsageAfter = await redis.get(usageKey)
    const usedTokensAfter = existingUsageAfter ? parseInt(existingUsageAfter) : 0

    const newUsage = usedTokensAfter + totalTokens

    await redis.set(usageKey, newUsage)

    const remainingTokens = MAX_TOKENS - newUsage

    logger.info({ requestId: correlationId, usedTokens: newUsage, remainingTokens }, "Token usage update")

    //! save assistant response
    history.push({
        role: "assistant",
        content: fullResponse
    })

    //! save message in DB
    const newDate = Date.now()
    await prisma.chat.createMany({
        data: [
            {
                sessionId,
                role: "user",
                content: message,
                createdAt :new Date(newDate - 1)
            },
            {
                sessionId,
                role: "assistant",
                content: fullResponse,
                createdAt : new Date()
            }
        ]
    })

    //! store in redis (instead of overwriting full json)
    await redis.rpush(
        sessionId,
        JSON.stringify({ role: "user", content: message })
    )

    await redis.rpush(
        sessionId,
        JSON.stringify({ role: "assistant", content: fullResponse })
    )

    //! keep ony last 15 msg
    await redis.ltrim(sessionId, -15, -1)

    //! reset TTL
    await redis.expire(sessionId, 86400)
}

//! get history
export const getHistoryService = async ({ sessionId, page, limit }: GetHistoryInput) => {
    logger.info({ sessionId }, "DB fetching chat history")

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    const [chats, total] = await Promise.all([
        prisma.chat.findMany({
            where: { sessionId },
            skip,
            take: limitNumber,
            orderBy: { createdAt: "asc" }
        }),

        prisma.chat.count({
            where: { sessionId },
            skip,
            take: limitNumber
        })
    ])

    return {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        history: chats
    }
}

//! delete history
export const deleteHistoryService = async (sessionId: string) => {
    logger.warn({ sessionId }, "Deleting chat from DB + Redis")

    await prisma.chat.deleteMany({
        where: { sessionId }
    })

    await redis.del(sessionId)
    await redis.del(`usage:${sessionId}`)
    await redis.del(`chat_limit:${sessionId}`)

    return {
        message: "Chat session cleared",
        sessionId
    }
}

//! get usage
export const getUsageService = async (sessionId: string) => {
    logger.info({ sessionId }, "Fething token usage")

    const usageKey = `uasgeKey:${sessionId}`

    const usedTokenRaw = await redis.get(usageKey)
    const usedTokens = usedTokenRaw ? parseInt(usedTokenRaw) : 0

    const MAX_TOKENS = 100000

    const remainingTokens = MAX_TOKENS - usedTokens

    return {
        sessionId,
        usedTokens,
        remainingTokens
    }
}