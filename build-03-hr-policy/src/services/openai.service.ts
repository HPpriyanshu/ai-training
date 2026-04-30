import OpenAI from "openai"
import { config } from "../config.js"

// type Message = {
//     role : "user" | "assistant" | "system",
//     content : string
// }

// const openai = new OpenAI({
//     apiKey : config.OPENAI_KEY,
//     baseURL :  "https://api.groq.com/openai/v1"
// })

// export const streamLLM = async (message : Message[], onChunk : (chunk : string) => void) => {
//     const stream = await openai.chat.completions.create({
//         // model : "gpt-4o-mini",
//         model : "openai/gpt-oss-20b",
//         messages : message,
//         stream : true
//     })

//     //! streaming loop
//     for await (const part of stream){
//         const content = part.choices[0]?.delta?.content

//         if(content){
//             onChunk(content)
//         }
//     }
// }


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