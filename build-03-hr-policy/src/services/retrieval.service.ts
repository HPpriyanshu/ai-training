import { prisma } from "../utils/db.js"
import { createEmbedding } from "./openai.service.js"

type RetrievedChunk = {
    content : string,
    page : number,
    section : string | null,
    documentId : string,
    distance : number,
    keyword_score : number
}

export const retrievRelevantService = async (question : string) : Promise<RetrievedChunk[]> => {
    //* convert question to embedding
    const embedding = await createEmbedding(question)
    const vectorString = `[${embedding?.join(",")}]`

    //* Hybrid search (semantic + keyword)
    const results = await prisma.$queryRawUnsafe<RetrievedChunk[]>(`
        SELECT
            content,
            page,
            section,
            "documentId",

            embedding <=> '${vectorString}'::vector AS distance,

            ts_rank(content_tsv, websearch_to_tsquery($1)) AS keyword_score

        FROM "Chunk"

        ORDER BY 
            (0.8 * (1 / (1 + (embedding <=> '${vectorString}'::vector)))) +
            (0.2 * ts_rank(content_tsv, websearch_to_tsquery($1)))
        DESC

        LIMIT 10
    `, question)


    //* Semantic-only fallback search (IMPORTANT FIX)
    const semanticResults = await prisma.$queryRawUnsafe<RetrievedChunk[]>(`
        SELECT
            content,
            page,
            section,
            "documentId",

            embedding <=> '${vectorString}'::vector AS distance,
            0 AS keyword_score

        FROM "Chunk"

        ORDER BY embedding <=> '${vectorString}'::vector
        LIMIT 10
    `)


    //* Merge both results
    const combined = [...results, ...semanticResults]

    //* Remove duplicates (based on content)
    const unique = Array.from(
        new Map(combined.map(r => [r.content, r])).values()
    )

    //* Re-rank again
    const final = unique.sort((a, b) => {
        const scoreA =
            0.8 * (1 / (1 + a.distance)) +
            0.2 * a.keyword_score

        const scoreB =
            0.8 * (1 / (1 + b.distance)) +
            0.2 * b.keyword_score

        return scoreB - scoreA
    })

    //* Return top 5
    return final.slice(0, 5)
}