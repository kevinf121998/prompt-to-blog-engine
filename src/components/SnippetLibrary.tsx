'use client';

import { useState, useEffect } from 'react';
import { SnippetSet, SnippetLibraryFilters } from '@/types/snippets';
import { getSnippetSets, deleteSnippetSet } from '@/utils/storage';
import { exportHooksCSV, exportSnippetsJSON, exportQuotesTXT } from '@/utils/download';
import { showToast } from '@/utils/toast';

export default function SnippetLibrary() {
  const [snippetSets, setSnippetSets] = useState<SnippetSet[]>([]);
  const [filters, setFilters] = useState<SnippetLibraryFilters>({
    searchTerm: '',
    selectedTags: []
  });
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSnippetSets();
  }, []);

  const loadSnippetSets = () => {
    const sets = getSnippetSets();
    setSnippetSets(sets);
  };

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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this snippet set?')) {
      deleteSnippetSet(id);
      loadSnippetSets();
      showToast('Snippet set deleted');
    }
  };

  const handleExport = (snippetSet: SnippetSet, type: 'hooks' | 'snippets' | 'quotes') => {
    try {
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

  // Get all unique tags for filtering
  const allTags = Array.from(new Set(snippetSets.flatMap(set => set.tags))).sort();

  // Filter snippet sets
  const filteredSets = snippetSets.filter(set => {
    const matchesSearch = !filters.searchTerm || 
      set.sourceTitle?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      set.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    const matchesTags = filters.selectedTags.length === 0 ||
      filters.selectedTags.some(tag => set.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const renderSnippetItem = (text: string, index: number, type: string, setId: string) => {
    const itemId = `${setId}-${type}-${index}`;
    const isCopied = copiedItems.has(itemId);

    return (
      <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg bg-white">
        <p className="text-gray-800 text-sm leading-relaxed flex-1 mr-3">{text}</p>
        <button
          onClick={() => copyToClipboard(text, itemId)}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-black mb-2">Snippet Library</h2>
        <p className="text-gray-600 text-sm">Your saved reusable content assets</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search by title or tags..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-black transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      selectedTags: prev.selectedTags.includes(tag)
                        ? prev.selectedTags.filter(t => t !== tag)
                        : [...prev.selectedTags, tag]
                    }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filters.selectedTags.includes(tag)
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No snippet sets found</p>
          <p className="text-gray-400 text-sm mt-2">
            {snippetSets.length === 0 
              ? 'Start by extracting snippets from your drafts'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSets.map((snippetSet) => (
            <div key={snippetSet.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-1">
                    {snippetSet.sourceTitle}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Created {new Date(snippetSet.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {snippetSet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="relative group">
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      Export
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleExport(snippetSet, 'hooks')}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 rounded-t-lg"
                      >
                        Hooks (CSV)
                      </button>
                      <button
                        onClick={() => handleExport(snippetSet, 'snippets')}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                      >
                        All (JSON)
                      </button>
                      <button
                        onClick={() => handleExport(snippetSet, 'quotes')}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 rounded-b-lg"
                      >
                        Quotes (TXT)
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(snippetSet.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Notes */}
              {snippetSet.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm font-medium mb-1">Author Notes:</p>
                  <p className="text-blue-700 text-sm">{snippetSet.notes}</p>
                </div>
              )}

              {/* Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pull Quotes */}
                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Pull Quotes</h4>
                  <div className="space-y-2">
                    {snippetSet.pullQuotes.slice(0, 2).map((quote, index) => 
                      renderSnippetItem(quote, index, 'quote', snippetSet.id)
                    )}
                    {snippetSet.pullQuotes.length > 2 && (
                      <p className="text-gray-500 text-xs">+{snippetSet.pullQuotes.length - 2} more</p>
                    )}
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Examples</h4>
                  <div className="space-y-2">
                    {snippetSet.anonymizedExamples.slice(0, 1).map((example, index) => 
                      renderSnippetItem(example, index, 'example', snippetSet.id)
                    )}
                    {snippetSet.anonymizedExamples.length > 1 && (
                      <p className="text-gray-500 text-xs">+{snippetSet.anonymizedExamples.length - 1} more</p>
                    )}
                  </div>
                </div>

                {/* Social Hooks */}
                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Social Hooks</h4>
                  <div className="space-y-2">
                    {snippetSet.socialHooks.slice(0, 2).map((hook, index) => 
                      renderSnippetItem(hook, index, 'hook', snippetSet.id)
                    )}
                    {snippetSet.socialHooks.length > 2 && (
                      <p className="text-gray-500 text-xs">+{snippetSet.socialHooks.length - 2} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
