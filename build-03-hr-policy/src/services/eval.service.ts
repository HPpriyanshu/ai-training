import fs from "fs"
import { getFullResponse } from "../utils/eval.helper.js"
import { retrievRelevantService } from "./retrieval.service.js"

const dataset = JSON.parse(fs.readFileSync("src/data/test-questions.json", "utf-8"))

const judge = async (question: string , context: string, answer: string) => {
    const prompt = `
    Question: ${question}
    
    Context: ${context}
    
    Answer: ${answer}
    
    Is the answer fully supported by the context?

    - Answer YES only if all parts of the answer are clearly present in the context
    - Answer NO if any part is missing, assumed, or unrelated

    Answer only YES or NO.
    `

    const res = await getFullResponse([{role : "user", content : prompt}])

    return res.toLowerCase().includes("yes")
    
}

export const runEval = async () => {
    let retrievalHits = 0
    let faithful = 0
    let totalLatency = 0

    const details = []

    for (const test of dataset){
        const start = Date.now()

        //* retrieval
        const chunks = await retrievRelevantService(test.question)

        //* direct LLM call
        const answer = await getFullResponse([
            {
        role: "user",
        content: `
            Context:
            ${chunks.map(c => c.content).join("\n")}

            Question:
            ${test.question}
        `
            }
        ])

        const latency = Date.now() - start
        totalLatency += latency


        //* retrieval chunk
        const expected = test.expected_section.toLowerCase()

        const retrievalHit =
            test.expected_section === "NONE"
                ? chunks.length === 0 
                : chunks.some(c => (c.content || "").toLowerCase().includes(expected))
        
        if(retrievalHit) retrievalHits ++

        //* faithfullness
        const isFaithful = await judge(
            test.question,
            chunks.map(c => c.content).join("\n"),
            answer
        )

        if(isFaithful) faithful++

        details.push({
            question : test.question,
            retrievalHit,
            isFaithful,
            latency
        })
    }

    const latencies = details.map(d => d.latency).sort((a,b) => a-b)

    const percentile = (p: number) => {
        const index = Math.ceil((p/100) * latencies.length) - 1
        return latencies[index] || 0
    }

    const p50 = percentile(50)
    const p95 = percentile(95)
    const p99 = percentile(99)

      return {
        total: dataset.length,
        retrieval_precision: retrievalHits / dataset.length,
        faithfulness_score: faithful / dataset.length,
        avg_latency_ms: (totalLatency / dataset.length / 1000).toFixed(2),
        p50_latency: (p50 / 1000).toFixed(2),
        p95_latency : (p95 / 1000).toFixed(2),
        p99_latency : (p99 / 1000).toFixed(2),
        details
    }

}