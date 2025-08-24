import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Brief } from '@/types/brief';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a seasoned principal consultant at Radically Consulting NZ. Write concise, technically sound, value-adding content with zero fluff.
You will receive a JSON "brief" with: problem, audience, povBullets[], evidence[], cta, tone.
Rules:
- Use the 3 povBullets to shape the outline and arguments.
- If evidence is empty, do not invent facts; write from experience and clearly mark opinion.
- If evidence is present, cite only those items in a final "## Footnotes / Sources" section.
- Optimize for the specified audience.
- End with a clear Call to Action reflecting cta.
- Respect tone: Professional, Conversational, Thought Leadership, or Playful.
Outputs:
1) "## Blog Draft (600–800 words)" with H2/H3 headings, concrete examples, and practical takeaways.
2) "## LinkedIn Post (150–200 words)" with an engaging first line and a soft CTA.
3) "## Footnotes / Sources" listing only items from evidence[] (omit if none).`;

export async function POST(request: NextRequest) {
  try {
    const { brief } = await request.json();

    if (!brief) {
      return NextResponse.json(
        { error: 'Brief is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate content based on brief
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `BRIEF(JSON):\n${JSON.stringify(brief)}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content,
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate content: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
