import { SnippetSet } from '@/types/snippets';

const SNIPPETS_STORAGE_KEY = 'radSnippets_v1';

export const getSnippetSets = (): SnippetSet[] => {
  try {
    const stored = localStorage.getItem(SNIPPETS_STORAGE_KEY);
    if (!stored) return [];
    
    const snippets = JSON.parse(stored);
    return Array.isArray(snippets) ? snippets : [];
  } catch (error) {
    console.error('Failed to load snippets from localStorage:', error);
    return [];
  }
};

export const saveSnippetSet = (snippetSet: SnippetSet): void => {
  try {
    const existing = getSnippetSets();
    const updated = [...existing, snippetSet];
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save snippet set to localStorage:', error);
  }
};

export const deleteSnippetSet = (id: string): void => {
  try {
    const existing = getSnippetSets();
    const updated = existing.filter(snippet => snippet.id !== id);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete snippet set from localStorage:', error);
  }
};

export const isDuplicateSnippetSet = (draftHash: string, pullQuotes: string[]): boolean => {
  try {
    const existing = getSnippetSets();
    const quotesHash = pullQuotes.join('|');
    
    return existing.some(snippet => 
      snippet.draftHash === draftHash && 
      snippet.pullQuotes.join('|') === quotesHash
    );
  } catch (error) {
    console.error('Failed to check for duplicate snippet set:', error);
    return false;
  }
};
