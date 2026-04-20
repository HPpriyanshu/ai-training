import { config } from "../config.js";

/**
 * Pino Logger Configuration
 * 
 * Rules:
 * - Every log entry is a JSON object.
 * - Root-level properties: level, timestamp, message, requestId.
 * - Log levels: debug (Development), info (Production), error, warn.
 */
export const loggerConfig = {
  level: config.NODE_ENV === "development" ? "debug" : config.LOG_LEVEL,
  messageKey : "message",
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

  redact : [
    "req.headers.authorization",
    "password",
    "token",
    "apiKey"
  ],
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
    // Customize log structure to include requestId at root when available
    log: (object: any) => {
      // const { req, ...rest } = object;
      // if (req && req.id) {
      //   return { requestId: req.id, ...rest };
      // }
      // return {
      //   requestId : req?.id || null,
      //   ...rest
      // }

      return object
    },
  },
};
