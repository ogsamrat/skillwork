import Groq from 'groq-sdk';
import { getEnvVar } from './config.js';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface Subtask {
  description: string;
  capabilityHint?: string;
}

/**
 * Use Groq to split the user task into exactly two subtasks.
 * Returns array of two subtask descriptions (and optional capability hints for matching agents).
 */
export async function splitTaskIntoTwo(userTask: string): Promise<Subtask[]> {
  const apiKey = getEnvVar('GROQ_API_KEY');
  const groq = new Groq({ apiKey });

  const prompt = `You are a task decomposer. Split the following user task into exactly TWO independent subtasks that can be done by different AI agents. Reply with a JSON array of two objects, each with "description" (string) and optionally "capabilityHint" (string, e.g. "summarization", "translation", "code").
Example format: [{"description":"...","capabilityHint":"..."},{"description":"...","capabilityHint":"..."}]
Reply with ONLY the JSON array, no markdown or explanation.

User task: ${userTask}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 512,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? '';
  const json = content.replace(/^```json?\s*|\s*```$/g, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Groq did not return valid JSON for subtasks. Raw: ' + content.slice(0, 200));
  }

  if (!Array.isArray(parsed) || parsed.length < 2) {
    throw new Error('Groq did not return an array of at least 2 subtasks. Raw: ' + content.slice(0, 200));
  }

  const subtasks: Subtask[] = parsed.slice(0, 2).map((item: unknown) => {
    const o = item as Record<string, unknown>;
    return {
      description: String(o?.description ?? ''),
      capabilityHint: o?.capabilityHint != null ? String(o.capabilityHint) : undefined,
    };
  });

  return subtasks;
}
