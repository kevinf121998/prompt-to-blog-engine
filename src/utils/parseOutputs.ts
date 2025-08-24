export interface ParsedOutput {
  blogDraft: string;
  linkedInPost: string;
  footnotes: string;
}

export const parseOutputs = (rawOutput: string): ParsedOutput => {
  const sections = rawOutput.split(/(?=^## )/m);
  
  let blogDraft = '';
  let linkedInPost = '';
  let footnotes = '';
  
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    
    if (trimmed.includes('## Blog Draft')) {
      blogDraft = trimmed.replace(/^## Blog Draft.*?\n/, '').trim();
    } else if (trimmed.includes('## LinkedIn Post')) {
      linkedInPost = trimmed.replace(/^## LinkedIn Post.*?\n/, '').trim();
    } else if (trimmed.includes('## Footnotes') || trimmed.includes('## Sources')) {
      footnotes = trimmed.replace(/^## (Footnotes|Sources).*?\n/, '').trim();
    }
  }
  
  return {
    blogDraft,
    linkedInPost,
    footnotes
  };
};
