/**
 * lib/ai.ts — Provider-agnostic AI chat helper.
 *
 * Switch providers by setting AI_PROVIDER in your .env:
 *   AI_PROVIDER=anthropic   (default) — requires ANTHROPIC_API_KEY
 *   AI_PROVIDER=openai                — requires OPENAI_API_KEY
 *
 * Optionally set AI_MODEL to override the default model for the active provider.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "@/lib/env";

export type AiProvider = "anthropic" | "openai";

export const aiProvider: AiProvider = env.AI_PROVIDER;

const DEFAULT_MODELS: Record<AiProvider, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
};

export const aiModel = env.AI_MODEL ?? DEFAULT_MODELS[aiProvider];

export const billingUrl =
  aiProvider === "anthropic"
    ? "https://console.anthropic.com/settings/billing"
    : "https://platform.openai.com/settings/organization/billing/overview";

/** True when the error represents an API quota / rate-limit problem. */
export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    status?: number;
    code?: string;
    message?: string;
    error?: { code?: string };
  };
  if (e.status !== 429) return false;
  if (aiProvider === "anthropic") return true; // Anthropic 429 is always rate_limit_error
  // OpenAI distinguishes quota errors from generic rate limits
  const code = e.code ?? e.error?.code;
  const msg = (e.message ?? "").toLowerCase();
  return (
    code === "insufficient_quota" ||
    msg.includes("exceeded your current quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("quota")
  );
}

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface AiChatResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

/**
 * Send a chat request to the configured AI provider and return a
 * normalised result with `.content` and `.usage`.
 */
export async function aiChat(
  messages: AiMessage[],
  temperature = 0.2
): Promise<AiChatResult> {
  if (aiProvider === "anthropic") {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const systemPrompt =
      messages.find((m) => m.role === "system")?.content ?? "";
    const userMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await client.messages.create({
      model: aiModel,
      max_tokens: 2048,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: userMessages,
      temperature,
    });

    const content =
      response.content.find((b) => b.type === "text")?.text?.trim() ?? "";

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  // ── OpenAI ──────────────────────────────────────────────────────────────
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: aiModel,
    messages,
    temperature,
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "";
  const u = response.usage;

  return {
    content,
    usage: u
      ? {
          promptTokens: u.prompt_tokens,
          completionTokens: u.completion_tokens,
          totalTokens: u.total_tokens,
        }
      : null,
  };
}
