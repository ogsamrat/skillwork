import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Research agent handler: produces a research summary on the given query topic.
 * Calls Groq LLM to generate key facts, sources, and trends.
 */
export async function handleResearch(query: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    // Fallback: return mock research for demo when no API key
    console.log(`  ⚠️  No GROQ_API_KEY — returning mock research data`);
    return getMockResearch(query);
  }

  const groq = new Groq({ apiKey });

  console.log(`  🔬 Calling Groq (${GROQ_MODEL}) for research summary...`);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a research analyst. Provide a concise, factual research summary with key findings, data points, historical context, and cited trends. Keep it under 500 words.',
      },
      {
        role: 'user',
        content: `Write a research summary on: ${query}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result) throw new Error('Groq returned empty research result');

  return result;
}

function getMockResearch(query: string): string {
  return `## Research Summary: ${query}

**Historical Context:** The topic of "${query}" has been extensively studied over the past several decades. Researchers have identified key patterns and inflection points that shape current understanding.

**Key Findings:**
1. Significant growth trends have been observed since the mid-20th century
2. Multiple demographic, economic, and social factors contribute to the observed patterns
3. Regional variations exist, with urban areas showing different trajectories than rural regions

**Data Points:**
- Current estimates place relevant metrics at historically high levels
- Year-over-year growth rates have fluctuated between 1.2% and 2.5% over recent decades
- Projections suggest continued growth with gradual deceleration

**Trends:**
- Urbanization is a major driving factor
- Improved healthcare and living standards contribute to demographic shifts
- Policy interventions have had measurable impacts on trajectory

*Note: This is mock research data for demo purposes. Set GROQ_API_KEY for real LLM-generated research.*`;
}
