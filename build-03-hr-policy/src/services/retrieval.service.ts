import { prisma } from "../utils/db.js"
import { createEmbedding } from "./openai.service.js"

type RetrievedChunk = {
    content : string,
    page : number,
    section : string | null,
    documentId : string,
    distance : number
}

export const retrievRelevantService = async (question : string) : Promise<RetrievedChunk[]> => {
    //! convert question to embedding
    const embedding = await createEmbedding(question)

    const vectorString = `[${embedding?.join(",")}]`

    //! search top 5 similar chunks
    const results = await prisma.$queryRawUnsafe<RetrievedChunk[]>(`
        SELECT
            content,
            page,
            section,
            "documentId",
            embedding <-> '${vectorString}'::vector AS distance
        FROM "Chunk"
        ORDER BY embedding <-> '${vectorString}'::vector
        LIMIT 5
        `)

        return results
}