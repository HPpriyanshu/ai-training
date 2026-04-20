import {PrismaClient} from "@prisma/client"
import {PrismaPg} from "@prisma/adapter-pg"
import { config } from "../config.js"
import { logger } from "./logger.js"


const adapter = new PrismaPg({
    connectionString: config.DATABASE_URL
})

export const prisma = new PrismaClient({
    adapter
})

prisma.$connect()
    .then(() => {
        logger.info({message : "Postgres connected"})
    })
    .catch((err) => {
        logger.error({message : "Postgres connection error : ", error : err.message})
    })