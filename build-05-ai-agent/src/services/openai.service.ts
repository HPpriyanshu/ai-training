import OpenAI from "openai"
import { config } from "../config.js"

const openai = new OpenAI({
    apiKey : config.OPENAI_KEY
})

export const createEmbedding = async (text : string) => {
    const response = await openai.embeddings.create({
        model : "text-embedding-3-small",
        input : text
    })

    return response.data[0]?.embedding
};


export const createEmbeddings = async (texts : string[]) => {
    const response = await openai.embeddings.create({
        model : "text-embedding-3-small",
        input : texts
    })

    return response.data.map(item => item.embedding)
}

export const createChatCompletion = async (messages : any[], onChunk : (chunk : string) => void) => {
    const stream = await openai.chat.completions.create({
        model : "gpt-4o-mini",
        messages,
        stream : true
    })

    for await (const part of stream){
        const content = part.choices?.[0]?.delta?.content

        if(content){
            onChunk(content)
        }
    }
}

//! agent call (without streaming)
export const createAgentCompletion = async (messages : any[], tools : any[]) => {
    
    const response = await openai.chat.completions.create({
        model : "gpt-4o-mini",
        messages,
        tools
    })

    return response.choices[0].message
}