import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Stats agent handler: produces a statistical summary on the given query topic.
 * Calls Groq LLM to generate numbers, growth rates, and comparisons.
 */
export async function handleStats(query: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    // Fallback: return mock stats for demo when no API key
    console.log(`  ⚠️  No GROQ_API_KEY — returning mock statistical data`);
    return getMockStats(query);
  }

  const groq = new Groq({ apiKey });

  console.log(`  📊 Calling Groq (${GROQ_MODEL}) for statistical summary...`);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a statistical analyst. Provide a concise statistical summary with specific numbers, percentages, growth rates, timelines, and comparative data. Include tables or bullet points. Keep it under 500 words.',
      },
      {
        role: 'user',
        content: `Provide a statistical analysis of: ${query}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result) throw new Error('Groq returned empty stats result');

  return result;
}

function getMockStats(query: string): string {
  return `## Statistical Summary: ${query}

**Population Figures (selected years):**

| Year | Population    | Growth Rate |
|------|--------------|-------------|
| 1950 | 376 million  | 1.8%        |
| 1970 | 555 million  | 2.2%        |
| 1990 | 873 million  | 2.1%        |
| 2000 | 1.06 billion | 1.9%        |
| 2010 | 1.23 billion | 1.6%        |
| 2020 | 1.38 billion | 1.0%        |
| 2023 | 1.44 billion | 0.7%        |

**Key Statistics:**
- Total growth 1950–2023: ~283% increase
- Peak growth rate: 2.3% (1974)
- Current annual growth: ~0.7% (decelerating)
- Urban population share: 35% (2023)
- Median age: 28.2 years (2023)
- Fertility rate: 2.0 (2023, near replacement level)

**Projections:**
- 2030 estimate: ~1.52 billion
- 2050 estimate: ~1.67 billion (peak)
- Post-2060: expected gradual decline

*Note: This is mock statistical data for demo purposes. Set GROQ_API_KEY for real LLM-generated statistics.*`;
}
