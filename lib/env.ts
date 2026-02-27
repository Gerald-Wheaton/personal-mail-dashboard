import { z } from "zod";

const envSchema = z.object({
  // ── AI provider ──────────────────────────────────────────────────────────
  // Set AI_PROVIDER to "anthropic" (default) or "openai"
  AI_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
  // Override the model; defaults to claude-haiku-4-5-20251001 (Anthropic)
  // or gpt-4o-mini (OpenAI) when not set
  AI_MODEL: z.string().optional(),

  // API keys — only the key for the active provider is required at runtime
  ANTHROPIC_API_KEY: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1),

  // ── Google OAuth ─────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  // ── App ───────────────────────────────────────────────────────────────────
  APP_ENC_KEY: z.string().min(8),
});

export const env = envSchema.parse({
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_MODEL: process.env.AI_MODEL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  APP_ENC_KEY: process.env.APP_ENC_KEY,
});
