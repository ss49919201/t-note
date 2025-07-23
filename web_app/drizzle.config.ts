import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./infra/db/d1/schema.ts",
  out: "./infra/db/d1/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
