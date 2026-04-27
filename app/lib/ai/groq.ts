/**
 * app/lib/ai/groq.ts
 *
 * Single source of truth for Groq API configuration.
 * Exports the shared Groq client and model name used by all AI routes.
 * Model and key-name changes happen here — all callers update automatically.
 *
 * Current model: llama-4-scout-17b-16e-instruct (via CONFIG.groqModel fallback)
 */

/** Default model when GROQMODEL env var is not set. */
export const DEFAULT_GROQ_MODEL = "llama-4-scout-17b-16e-instruct";

/**
 * Returns the resolved Groq API key and model name.
 * Throws if no API key is available.
 *
 * Key resolution order:
 *   1. GROQAPIKEY  (canonical, set since launch)
 *   2. GROQ_API_KEY (legacy fallback, kept for safety)
 */
export function getGroqConfig(): { apiKey: string; model: string } {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  const model = process.env.GROQMODEL || DEFAULT_GROQ_MODEL;

  return { apiKey, model };
}
