'use client';

import { useState } from 'react';
import { ExtractedSnippets, SnippetSet } from '@/types/snippets';
import { Brief } from '@/types/brief';
import { hashString } from '@/utils/hash';
import { saveSnippetSet, isDuplicateSnippetSet } from '@/utils/storage';
import { exportHooksCSV, exportSnippetsJSON, exportQuotesTXT } from '@/utils/download';
import { showToast } from '@/utils/toast';

interface SnippetsPanelProps {
  snippets: ExtractedSnippets;
  brief: Brief;
  blogDraft: string;
}

export default function SnippetsPanel({ snippets, brief, blogDraft }: SnippetsPanelProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const saveToLibrary = async () => {
    try {
      const draftHash = await hashString(blogDraft);
      
      // Check for duplicates
      if (isDuplicateSnippetSet(draftHash, snippets.pullQuotes)) {
        showToast('Snippets already saved to library', 'error');
        return;
      }

      const snippetSet: SnippetSet = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        brief,
        draftHash,
        pullQuotes: snippets.pullQuotes,
        anonymizedExamples: snippets.anonymizedExamples,
        socialHooks: snippets.socialHooks,
        tags: snippets.tags,
        notes: snippets.notes,
        sourceTitle: snippets.pullQuotes[0] || 'Untitled'
      };

      saveSnippetSet(snippetSet);
      showToast('Snippets saved to library');
    } catch (error) {
      console.error('Failed to save snippets:', error);
      showToast('Failed to save snippets', 'error');
    }
  };

  const handleExport = (type: 'hooks' | 'snippets' | 'quotes') => {
    try {
      const snippetSet: SnippetSet = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        brief,
        draftHash: '',
        pullQuotes: snippets.pullQuotes,
        anonymizedExamples: snippets.anonymizedExamples,
        socialHooks: snippets.socialHooks,
        tags: snippets.tags,
        notes: snippets.notes,
        sourceTitle: snippets.pullQuotes[0] || 'Untitled'
      };

      switch (type) {
        case 'hooks':
          exportHooksCSV(snippetSet);
          break;
        case 'snippets':
          exportSnippetsJSON(snippetSet);
          break;
        case 'quotes':
          exportQuotesTXT(snippetSet);
          break;
      }
      showToast(`${type} exported successfully`);
    } catch (error) {
      console.error('Failed to export:', error);
      showToast('Failed to export', 'error');
    }
  };

  const renderSnippetItem = (text: string, index: number, type: string) => {
    const itemId = `${type}-${index}`;
    const isCopied = copiedItems.has(itemId);

    return (
      <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-white">
        <p className="text-gray-800 text-sm leading-relaxed flex-1 mr-3">{text}</p>
        <button
          onClick={() => copyToClipboard(text, itemId)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black mb-2">Extracted Snippets</h2>
          <p className="text-gray-600 text-sm">Reusable content assets from your draft</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveToLibrary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Save to Library
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExport('hooks')}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                Export Hooks (CSV)
              </button>
              <button
                onClick={() => handleExport('snippets')}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export All (JSON)
              </button>
              <button
                onClick={() => handleExport('quotes')}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
              >
                Export Quotes (TXT)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags and Notes */}
      <div className="flex flex-wrap gap-2 items-center">
        {snippets.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border"
          >
            {tag}
          </span>
        ))}
      </div>

      {snippets.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm font-medium mb-1">Author Notes:</p>
          <p className="text-blue-700 text-sm">{snippets.notes}</p>
        </div>
      )}

      {/* Pull Quotes */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Pull Quotes</h3>
        <div className="space-y-3">
          {snippets.pullQuotes.map((quote, index) => 
            renderSnippetItem(quote, index, 'quote')
          )}
        </div>
      </div>

      {/* Anonymized Examples */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Anonymized Examples</h3>
        <div className="space-y-3">
          {snippets.anonymizedExamples.map((example, index) => 
            renderSnippetItem(example, index, 'example')
          )}
        </div>
      </div>

      {/* Social Hooks */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Social Hooks</h3>
        <div className="space-y-3">
          {snippets.socialHooks.map((hook, index) => 
            renderSnippetItem(hook, index, 'hook')
          )}
        </div>
      </div>
    </div>
  );
}
