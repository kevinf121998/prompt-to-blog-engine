import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Brief } from '@/types/brief';
import { ExtractedSnippets } from '@/types/snippets';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a seasoned principal consultant and editor at Radically Consulting NZ. You extract reusable, concise, value-adding assets from a provided brief and blog draft. Do not invent facts. Anonymize any identifying details (companies, people, products) into generic roles/industries. No fluff.
Return strict JSON only, matching the schema.
Rules:
- pullQuotes: 3 items, ≤ 140 characters each, self-contained and punchy.
- anonymizedExamples: 2–3 items, 80–120 words each, concrete, technically sound, anonymized; include problem → approach → outcome.
- socialHooks: 5 items, ≤ 120 characters, intriguing first-line openers for LinkedIn.
- tags: 3–6 short topic tags.
- notes: optional 1–2 lines of guidance for the author.`;

export async function POST(request: NextRequest) {
  try {
    const { brief, blogDraft } = await request.json();

    if (!brief || !blogDraft) {
      return NextResponse.json(
        { error: 'Brief and blog draft are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const userContent = `BRIEF(JSON):
${JSON.stringify(brief)}

BLOG_DRAFT(MARKDOWN):
${blogDraft}

REQUIRED_OUTPUT_SCHEMA(JSON):
{
  "pullQuotes": string[3],
  "anonymizedExamples": string[2-3],
  "socialHooks": string[5],
  "tags": string[3-6],
  "notes": string | null
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userContent
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to extract snippets' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let extractedSnippets: ExtractedSnippets;
    try {
      // Try to extract JSON from the response (in case model adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      extractedSnippets = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', content);
      return NextResponse.json(
        { error: 'Failed to parse extracted snippets. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!extractedSnippets.pullQuotes || !extractedSnippets.anonymizedExamples || 
        !extractedSnippets.socialHooks || !extractedSnippets.tags) {
      return NextResponse.json(
        { error: 'Invalid snippet structure received' },
        { status: 500 }
      );
    }

    return NextResponse.json(extractedSnippets);

  } catch (error) {
    console.error('Snippet extraction error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to extract snippets: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
