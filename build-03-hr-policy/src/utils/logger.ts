import pino from "pino"
import {loggerConfig} from "../plugins/logger.js"

export const logger = pino(loggerConfig)