import OpenAI from "openai"
import { config } from "../config.js"

type Message = {
    role : "user" | "assistant" | "system",
    content : string
}

const openai = new OpenAI({
    apiKey : config.OPENAI_KEY,
    baseURL :  "https://api.groq.com/openai/v1"
})

export const streamLLM = async (message : Message[], onChunk : (chunk : string) => void) => {
    const stream = await openai.chat.completions.create({
        // model : "gpt-4o-mini",
        model : "openai/gpt-oss-20b",
        messages : message,
        stream : true
    })

    //! streaming loop
    for await (const part of stream){
        const content = part.choices[0]?.delta?.content

        if(content){
            onChunk(content)
        }
    }
}