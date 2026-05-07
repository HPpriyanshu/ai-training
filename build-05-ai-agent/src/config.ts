import { z } from "zod";

/**
 * Environment variable schema using Zod.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4005").transform((v) => parseInt(v, 10)),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.string().default("info"),
  API_KEY: z.string().min(1, "API_KEY is required").default("your-default-secret-key"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  OPENAI_KEY: z.string().min(1,"Open ai key is required"),
  DATABASE_URL: z.string().min(1, "Database url is required")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;

export type Config = z.infer<typeof envSchema>;
