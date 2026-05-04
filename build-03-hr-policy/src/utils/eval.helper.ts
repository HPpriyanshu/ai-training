import { createChatCompletion } from "../services/openai.service.js"

type Message = {
    role: "user"
    content: string
}

export const getFullResponse = async (messages : Message[]) => {
    let fullText = ""

    await createChatCompletion(messages, (chunk : string) => {
        fullText += chunk
    })

    return fullText
}