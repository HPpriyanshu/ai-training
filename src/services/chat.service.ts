import { logger } from "../utils/logger.js"
import {redis} from "../utils/redis.js"
import { streamLLM } from "./openai.service.js"
import { countTokens } from "../utils/tokenizer.js"

type Message = {
    role : "user" | "assistant",
    content : string
}

export const processChat = async (sessionId : string, message : string, correlationId: string, onChunk : (chunk : string) => void) => {

    logger.info({ requestId : correlationId }, "Processing chat");

    //! get history from redis
    const existing = await redis.get(sessionId)
    let history :  Message[] = existing? JSON.parse(existing) : []

    //! count input token
    const inputText = [...history, {role : "user", content : message}].map(m => m.content).join(" ")
    const inputTokens = countTokens(inputText)

    logger.info({ requestId: correlationId, inputTokens }, "Input tokens")

    //! Token limit check (before LLM call)
    const usageKey = `usage:${sessionId}`
    const existingUsage = await redis.get(usageKey)
    const usedTokens = existingUsage ? parseInt(existingUsage) : 0

    const MAX_TOKENS = 100000

    if(usedTokens + inputTokens > MAX_TOKENS){
        throw new Error("Token Limit Exceed")
    }

    //! Add user message
    history.push({
        role : "user",
        content : message
    })

    let fullResponse = ""

    //! call openai service
    await streamLLM(history, (chunk : string) => {
        fullResponse += chunk
        onChunk(chunk)
    })

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

    logger.info({requestId : correlationId, usedTokens : newUsage, remainingTokens}, "Token usage update")

    //! save assistant response
    history.push({
        role : "assistant",
        content : fullResponse
    })

    //! store in redis (TTL 24 hr)
    await redis.set(
        sessionId,
        JSON.stringify(history),
        "EX",
        86400
    )
}