import { Brief } from './brief';

export interface SnippetSet {
  id: string;                 // uuid
  createdAt: string;          // ISO
  brief: Brief;               // from Step 1
  draftHash: string;          // hash of blog draft text
  pullQuotes: string[];
  anonymizedExamples: string[];
  socialHooks: string[];
  tags: string[];
  notes?: string;
  sourceTitle?: string;       // inferred H1 or generated title
}

export interface ExtractedSnippets {
  pullQuotes: string[];
  anonymizedExamples: string[];
  socialHooks: string[];
  tags: string[];
  notes?: string;
}

export interface SnippetLibraryFilters {
  searchTerm: string;
  selectedTags: string[];
}
