import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, tone = 'professional' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Format tone for consistency
    const formatTone = (tone: string) => {
      return tone === 'thought-leadership' ? 'Thought Leadership' : tone.charAt(0).toUpperCase() + tone.slice(1);
    };

    // Generate insight ideas
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a seasoned principal consultant at Radically Consulting NZ with strong thought leadership and writing skills.

Your task is to analyze a consultant's initial prompt and generate 3 distinct, compelling insight ideas that could be developed into valuable content.

Guidelines:
- Each insight should be specific, actionable, and valuable to business leaders
- Provide different angles or perspectives on the topic
- Make them concrete enough that the consultant can immediately see the value
- Each should be suitable for the selected tone: ${formatTone(tone)}
- Focus on practical business insights, not generic advice

Format your response as exactly 3 numbered insights:
1. [Insight title] - [Brief description of the angle/value]
2. [Insight title] - [Brief description of the angle/value]  
3. [Insight title] - [Brief description of the angle/value]

Keep each insight to 1-2 sentences maximum.`
        },
        {
          role: "user",
          content: `Generate 3 insight ideas from this prompt:\n\nPrompt: ${prompt}\nTone: ${formatTone(tone)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.8, // Higher temperature for more creative insight ideas
    });

    const fullResponse = completion.choices[0]?.message?.content?.trim();

    if (!fullResponse) {
      return NextResponse.json(
        { error: 'Failed to generate insight ideas' },
        { status: 500 }
      );
    }

    // Parse the numbered insights
    const lines = fullResponse.split('\n').filter(line => line.trim());
    const insightMatches = lines.filter(line => /^\d+\./.test(line));
    
    if (!insightMatches || insightMatches.length !== 3) {
      return NextResponse.json(
        { error: 'Failed to generate 3 insight ideas' },
        { status: 500 }
      );
    }

    const insights = insightMatches.map((match, index) => {
      const cleanMatch = match.replace(/^\d+\.\s*/, '').trim();
      const [title, ...descriptionParts] = cleanMatch.split(' - ');
      
      return {
        id: index + 1,
        title: title.trim(),
        description: descriptionParts.join(' - ').trim() || title.trim(),
        fullText: cleanMatch
      };
    });

    return NextResponse.json({
      insights,
      originalPrompt: prompt,
      tone: formatTone(tone)
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate insight ideas: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
