import OpenAI from "openai";
import { env } from "@/lib/env";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
export const openaiModel = env.OPENAI_MODEL ?? "gpt-4o-mini";
