import { tools } from "../agent/tool.js"
import { executeTool } from "../mcp/client/tool-router.service.js"
import { prisma } from "../utils/db.js"
import { logger } from "../utils/logger.js"
import { loadPrompt } from "../utils/prompt-loader.js"
import { redis } from "../utils/redis.js"
import { sessionLogs } from "../utils/session-log.js"
import { createAgentCompletion } from "./openai.service.js"
import { getTools } from "../mcp/client/tool-registry.service.js"
import { getAllClients } from "../mcp/client/client-manager.service.js"

type Message = {
    role: "system" | "user" | "assistant" | "tool"
    content: string,
    tool_call_id?: string,
    tool_calls?: any
}

//! get server
export const getConnectedServer = async () => {
    return getAllClients().map(c => ({
        id: c.id,
        status: "connected",
        transport: "stdio"
    }));
}

export const processAgentChat = async (sessionId : string, question : string, correlationId : string, onChunk : (chunk : string) => void) => {
    logger.info({requestId : correlationId}, "Processing agent chat")

    //* load prompt
    const systemPrompt = loadPrompt("agent.system.txt")
    
    //* user question
    const userPrompt = `User question : ${question}`

    //* load history
    let history : Message[] = []

    const cached = await redis.lrange(sessionId, 0, -1)

    if(cached.length > 0){
        history = cached.map((item : string) => JSON.parse(item))
    }else{
        const historyFromDB = await prisma.chat.findMany({
            where : {sessionId},
            orderBy : {
                createdAt : "asc"
            },
            take : 15
        })

        history = historyFromDB.map((m) => ({
            role : m.role as "user" | "assistant",
            content : m.content
        }))
    }

    //* add user message
    history.push({
        role : "user",
        content : userPrompt
    })

    //* messages
    const messages : Message[] = [
        {
            role : "system",
            content : systemPrompt
        },
        ...history
    ]

    let finalResponse = ""
    let blocked = false

    sessionLogs[sessionId] = sessionLogs[sessionId] || []

    sessionLogs[sessionId].push({
        type : "user",
        question,
        timeStamp : new Date().toISOString()
    })

    //* total usage
    const totalUsage: Record<string, number> = {}

    //* Agent loop
    for(let i = 0; i < 5; i++){

        const mcpTools = await getTools()

        const formattedTools = mcpTools.tools.map((tool) => ({
            type : "function",
            function : {
                name : tool.name,
                description : tool.description,
                parameters : tool.inputSchema
            }
        }))

        const msg = await createAgentCompletion(messages, formattedTools)

        if(msg.tool_calls){
            messages.push({
                role : "assistant",
                content : msg.content || "",
                tool_calls: msg.tool_calls
            })

            for (const toolCall of msg.tool_calls){
                if(toolCall.type !== "function") continue
                const name = toolCall.function.name
                const args = JSON.parse(toolCall.function.arguments)

                totalUsage[name] = (totalUsage[name] || 0) + 1

                if(totalUsage[name] > 3){
                    throw new Error(`Tool limit exceeded for ${name}`)
                }

                logger.info({requestId : correlationId}, `Tool called: ${name}`)

                onChunk(`[TOOL] calling ${name}\n`)

                sessionLogs[sessionId].push({
                    type : "tool_call",
                    tool : name,
                    args,
                    timeStamp : new Date().toISOString()
                })

                const result = await executeTool(name, args)

                sessionLogs[sessionId].push({
                    type : "tool_result",
                    tool : name,
                    result,
                    timeStamp : new Date().toISOString()
                })

                messages.push({
                    role : "tool",
                    tool_call_id: toolCall.id,
                    content : JSON.stringify(result)
                })
            }
        }
        else {
            finalResponse = msg.content || ""
            break
        }
    }

    sessionLogs[sessionId].push({
        type : "final_response",
        response : finalResponse,
        timeStamp : new Date().toISOString()
    })

    //* stream 
    let buffer = ""

    for(const char of finalResponse){
        if(blocked) break

        buffer += char

        if(buffer.length > 20){
            onChunk(buffer)
            buffer = ""
        }
    }

    if(!blocked && buffer.length  > 0){
        onChunk(buffer)
    }

    //* save in db
    const now  = Date.now()

    await prisma.chat.createMany({
        data : [
            {
                sessionId,
                role : "user",
                content : question,
                createdAt : new Date(now - 1)
            },

            {
                sessionId,
                role : "assistant",
                content : finalResponse,
                createdAt : new Date()
            }
        ]
    })

    //* redis cache
    await redis.rpush(
        sessionId,
        JSON.stringify({role : "user", content : question})
    )

    await redis.rpush(
        sessionId,
        JSON.stringify({role : "assistant", content : finalResponse})
    )


    await redis.ltrim(sessionId, -15, -1)
    await redis.expire(sessionId, 86400)

}

//! get tools
export const getToolService = async () => {

    const tool = (await getTools()).tools.map(tool => ({
        name : tool.name,
        description : tool.description
    }))

    return tool
}

//! logs
export const getSessionLogs = async (sessionId : string) => {
    const logs = sessionLogs[sessionId]

    return logs ? logs : {
        message : "No logs are there"
    }
}