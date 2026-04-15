import { logger } from "../utils/logger.js"
import {redis} from "../utils/redis.js"
import { streamLLM } from "./openai.service.js"

type Message = {
    role : "user" | "assistant",
    content : string
}

export const processChat = async (sessionId : string, message : string, correlationId: string, onChunk : (chunk : string) => void) => {

    logger.info({ requestId : correlationId }, "Processing chat");

    //! get history from redis
    const existing = await redis.get(sessionId)
    let history :  Message[] = existing? JSON.parse(existing) : []

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