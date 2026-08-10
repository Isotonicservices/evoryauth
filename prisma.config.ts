// This file is required by Prisma 7 CLI for schema push/generate
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env file
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
