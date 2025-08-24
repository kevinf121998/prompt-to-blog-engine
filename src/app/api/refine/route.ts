import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, content, instruction, contentType, tone = 'professional' } = await request.json();

    if (!content || !instruction) {
      return NextResponse.json(
        { error: 'Content and instruction are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Format tone for consistency with main system prompt
    const formatTone = (tone: string) => {
      return tone === 'thought-leadership' ? 'Thought Leadership' : tone.charAt(0).toUpperCase() + tone.slice(1);
    };

    const isLinkedInPost = contentType === 'social';
    const contentTypeDescription = isLinkedInPost ? 'LinkedIn/social media post' : 'blog post';

    const refinementCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a seasoned principal consultant at Radically Consulting NZ with strong thought leadership and writing skills.
          
          Your task is to refine existing content based on specific instructions while maintaining:
          - Technical credibility and business value
          - The core message and insights
          - Professional quality appropriate for business consultants
          - Radically Consulting NZ's expertise and perspective
          - The specified tone: ${formatTone(tone)}
          
          Tone guidelines:
          - Professional → polished, formal but approachable
          - Conversational → clear, human, lightly informal
          - Thought Leadership → authoritative, visionary, slightly provocative
          - Playful → light-hearted, witty, but still insightful
          
          ${isLinkedInPost ? 
            'For LinkedIn posts: Keep engaging, maintain 150-200 words, encourage engagement, spark dialogue.' :
            'For blog posts: Maintain clear structure with headings, 600-800 words, actionable insights, practical takeaways.'
          }`
        },
        {
          role: "user",
          content: `Please refine this ${contentTypeDescription} according to the following instruction:

**Instruction:** ${instruction}

**Original ${contentTypeDescription}:**
${content}

**Context:** This content was originally created from the prompt: "${originalPrompt}"

Please provide the refined version that follows the instruction while maintaining the quality and perspective expected from Radically Consulting NZ.`
        }
      ],
      max_tokens: isLinkedInPost ? 400 : 1500,
      temperature: 0.7,
    });

    const refinedContent = refinementCompletion.choices[0]?.message?.content?.trim();

    if (!refinedContent) {
      return NextResponse.json(
        { error: 'Failed to refine content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      refinedContent,
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to refine content: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
