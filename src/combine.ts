import Groq from 'groq-sdk';
import { getEnvVar } from './config.js';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Combine two subtask results into one coherent response for the user.
 * Uses Groq to merge and format; falls back to concatenation if Groq fails.
 */
export async function combineResults(
  subtask1Description: string,
  result1: string,
  subtask2Description: string,
  result2: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return `[${subtask1Description}]\n${result1}\n\n[${subtask2Description}]\n${result2}`;
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: `Combine these two agent outputs into one clear, coherent response for the user. Do not add extra commentary, just merge and format nicely.

Subtask 1 (${subtask1Description}):
${result1}

Subtask 2 (${subtask2Description}):
${result2}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const combined = completion.choices[0]?.message?.content?.trim();
    return combined ?? `[${subtask1Description}]\n${result1}\n\n[${subtask2Description}]\n${result2}`;
  } catch {
    return `[${subtask1Description}]\n${result1}\n\n[${subtask2Description}]\n${result2}`;
  }
}
