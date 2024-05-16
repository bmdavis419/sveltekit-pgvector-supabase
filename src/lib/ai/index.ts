import { OPENAI_API_KEY } from "$env/static/private";

import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
});

export const openaiModel = openai.chat("gpt-3.5-turbo");
export const openaiEmbedding = openai.embedding("text-embedding-ada-002");
