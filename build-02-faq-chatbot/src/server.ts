import Fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import { config, type Config } from "./config.js";
import { healthRoutes } from "./routes/health.js";
import { initialRoute } from "./routes/index.js";
import { v4 as uuidv4 } from "uuid"
import "./utils/redis.js"
import "./utils/db.js"
import { logger } from "./utils/logger.js";

/**
 * Initialize Fastify with Pino logger configuration
 */
const fastify = Fastify({
  logger: false,
  loggerInstance: logger,
  requestIdLogLabel: "requestId",
  genReqId: (req) => typeof req.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : uuidv4()
});

// Augment FastifyInstance with Config type
declare module "fastify" {
  interface FastifyInstance {
    config: Config;
  }
}

// Attach the validated config to the fastify instance
fastify.decorate("config", config);

const start = async () => {
  try {
    // 1. Register security plugins
    await fastify.register(fastifyHelmet);
    await fastify.register(fastifyCors, {
      origin: "*",
    });

    // 2. Register Routes
    await fastify.register(healthRoutes);
    await fastify.register(initialRoute, { prefix: "/api/v1" });

    // 4. Start the server
    const { PORT, HOST } = fastify.config;
    await fastify.listen({ port: PORT, host: HOST });

    logger.info(`Server is running at http://${HOST}:${PORT}`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handling
 */
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info("Received shutdown signal. Closing server...");
    await fastify.close();
    process.exit(0);
  });
});

start();

