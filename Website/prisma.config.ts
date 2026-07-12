import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:ecosphere2024@localhost:5432/ecosphere";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
