import {PDFParse } from "pdf-parse"
// import pdf from "pdf-parse"
import crypto from "crypto"
import { logger } from "../utils/logger.js"
import { prisma } from "../utils/db.js"
import { createEmbedding, createEmbeddings } from "./openai.service.js"
import {randomUUID} from "crypto"

type fileInput = {
    buffer : Buffer
    mimetype : string
    filename : string
}

type chunk = {
    content : string
    page : number
    section? : string
}

//! validate file
export const validateFile = (file : fileInput) => {
    const allowedTypes = ["application/pdf", "text/plain"]

    if(!allowedTypes.includes(file.mimetype)){
        logger.warn({mimetype : file.mimetype}, "Invalid file type")
        
        throw new Error("Only PDF and TXT")
    }

    if(!file.buffer || file.buffer.length === 0){
        logger.warn("Empty file received")
        
        throw new Error("Empty file")
    }
}

//! hash
export const generateHashFile = (buffer : Buffer) => {
    const hash = crypto.createHash("sha256").update(buffer).digest("hex")

    logger.debug({hash}, "Generated file hash")

    return hash    
}

//! Extract text
export const extractTextFromPDF = async (buffer : Buffer) => {
    try {
        // const data = await (pdf as any)(buffer)
        const parser = new PDFParse({data : buffer})

        const data = await parser.getText()
        
        if(!data.text || data.text.trim().length === 0){
            throw new Error("No text extracted")
        }

        logger.debug("PDF text extraction successful")

        return data.text
    } catch (error) {
        logger.error("PDF parsing failed")
        throw new Error("Failed to parse PDF")
    }
}

//! Detect section
const detectSection = (text : string) : string => {
    // if(!text) return "General"

    const firstLine = text.split("\n")[0]?.trim() || ""

    if(firstLine.length < 100 && firstLine === firstLine.toUpperCase()){
        return firstLine
    }

    if(firstLine.toLowerCase().includes("policy")){
        return firstLine
    }

    return "General"
}

//! chunking
const chunk_size = 400
const overlap = 50

export const chunkText = (text : string) : chunk[] => {
   const words = text.split(/\s+/).filter(Boolean)

   const chunks: chunk[] = []
   let start = 0
   let page = 1

   while (start < words.length){
    //* take chunk
    const end = start + chunk_size
    const chunkWords = words.slice(start, end)

    const content = chunkWords.join(" ")

    chunks.push({
        content,
        page,
        section : detectSection(content)
    })

    page++

    //* move with overlap
    start += (chunk_size - overlap)
   }

   logger.debug({totalChunks : chunks.length, totalWords: words.length}, "Chunking completed (with overlap)")

   return chunks
}

//! main function
export const processDocument = async (file : fileInput) => {
    logger.info({filename : file.filename}, "Starting document processing")

    validateFile(file)

    const fileHash = generateHashFile(file.buffer)

    //* idempotency check
    const existing = await prisma.document.findUnique({
        where : {fileHash}
    })

    if(existing){
        logger.warn({fileHash}, "Duplicate file uploaded")

        return {
            message : "Document already exists",
            documentId : existing.id
        }
    }

    //** extract text

    let text = ""

    if(file.mimetype === "application/pdf"){
        text = await extractTextFromPDF(file.buffer)
    }else {
        text = file.buffer.toString("utf-8")
    }

    //* chunking
    const chunks = chunkText(text)

    //* create document
    const document = await prisma.document.create({
        data : {
            filename : file.filename,
            fileHash
        }
    })

    const BATCH_SIZE = 50

    for(let i = 0; i < chunks.length; i += BATCH_SIZE){
        const batch = chunks.slice(i, i + BATCH_SIZE)

        //! get embedding in one openai call
        const inputs = batch.map(c => c.content)

        const response = await createEmbeddings(inputs)

        //! insert all chunks of this batch
        for(let j = 0; j < batch.length ; j++){
            const embedding = response[j]

            const vectorString = `[${embedding?.join(",")}]`

            await prisma.$executeRaw`
            INSERT INTO "Chunk" (id, content, page, section, embedding, "embeddingModel", "documentId", content_tsv)
            VALUES(
                ${randomUUID()},
                ${batch[j]?.content},
                ${batch[j]?.page},
                ${batch[j]?.section},
                ${vectorString}::vector,
                'text-embedding-3-small',
                ${document.id},
                to_tsvector('english', ${batch[j]?.content})
            )`
        }
    }

    logger.info({
        filename : file.filename,
        chunks : chunks.length
    }, "Document processing completed")

    return {
        filename : file.filename,
        fileHash,
        totalChunks : chunks.length,
        preview : chunks.slice(0,3)
    }
}