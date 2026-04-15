import Redis from "ioredis";
import {config} from "../config.js"
import { logger } from "./logger.js";

export const redis = new (Redis as any)({
    host : config.REDIS_HOST,
    port : config.REDIS_PORT
})

redis.on("connect", () => {
    logger.info({message : "Redis connected"})
})

redis.on("error", (err: Error) => {
    logger.error({message : "Redis error : ", error : err.message})
})