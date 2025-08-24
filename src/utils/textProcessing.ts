

export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const getReadingTime = (wordCount: number): number => {
  return Math.ceil(wordCount / 225); // 225 words per minute
};

export const hasCitations = (footnotes: string): boolean => {
  return footnotes.trim().length > 0;
};



export const getToneDescription = (tone: string): string => {
  const descriptions: Record<string, string> = {
    'Professional': 'Polished, formal but approachable',
    'Conversational': 'Clear, human, lightly informal',
    'Thought Leadership': 'Authoritative, visionary, provocative',
    'Playful': 'Light-hearted, witty, still insightful'
  };
  return descriptions[tone] || 'Professional tone';
};
