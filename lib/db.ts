import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/lib/env";

const client = postgres(env.DATABASE_URL, {
  ssl: "require",
  max: 10,
});

export const db = drizzle(client);
