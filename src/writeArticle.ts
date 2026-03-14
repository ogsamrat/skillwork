import Groq from 'groq-sdk';
import { getEnvVar } from './config.js';

// Use Qwen 3 32B for article writing (qwen-qwq-32b is deprecated)
const QWEN_MODEL = 'qwen/qwen3-32b';

/**
 * Write an article using Groq Qwen with reasoning, from research + stats summaries.
 * Uses reasoning_format: "hidden" so only the final article is returned.
 */
export async function writeArticle(
  topic: string,
  researchSummary: string,
  statsSummary: string
): Promise<string> {
  const apiKey = getEnvVar('GROQ_API_KEY');
  const groq = new Groq({ apiKey });

  console.log(`  📝 Writing article with Groq Qwen (${QWEN_MODEL})...`);
  console.log(`     reasoning_format: "hidden" — only final article returned`);

  const completion = await groq.chat.completions.create({
    model: QWEN_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional article writer. Given the following research summary and statistical summary, write a well-structured, engaging article. Include an introduction, body sections with data, and a conclusion. Output only the article, no preamble or meta commentary.',
      },
      {
        role: 'user',
        content: `Write an article on: ${topic}

=== RESEARCH SUMMARY ===
${researchSummary}

=== STATISTICAL SUMMARY ===
${statsSummary}

Write a comprehensive, well-cited article that weaves together both the qualitative research and quantitative statistical data. The article should be about 600-800 words.`,
      },
    ],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 4096,
    // @ts-ignore — reasoning_format may not be in SDK types yet
    reasoning_format: 'hidden',
  });

  const article = completion.choices[0]?.message?.content?.trim();
  if (!article) throw new Error('Qwen returned empty article');

  console.log(`  📄 Article length: ${article.length} characters`);

  return article;
}
