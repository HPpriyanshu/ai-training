import "dotenv/config" 
import { defineConfig } from "prisma/config";
import { config } from "./src/config.js";

export default defineConfig({
  schema: "./src/prisma/schema.prisma",
  migrations: {
    path: "./src/prisma/migrations",
  },
  datasource: {
    url: config.DATABASE_URL
  },
});
