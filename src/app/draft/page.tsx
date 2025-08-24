'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BriefCard from '@/components/BriefCard';
import OutputSection from '@/components/OutputSection';
import SnippetsPanel from '@/components/SnippetsPanel';
import SnippetLibrary from '@/components/SnippetLibrary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Brief } from '@/types/brief';
import { ParsedOutput, parseOutputs } from '@/utils/parseOutputs';
import { ExtractedSnippets } from '@/types/snippets';
import { showToast } from '@/utils/toast';
import { hashString } from '@/utils/hash';
import { getWordCount, getReadingTime } from '@/utils/textProcessing';

export default function DraftPage() {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [outputs, setOutputs] = useState<ParsedOutput | null>(null);
  const [extractedSnippets, setExtractedSnippets] = useState<ExtractedSnippets | null>(null);
  const [isExtractingSnippets, setIsExtractingSnippets] = useState(false);
  const [activeTab, setActiveTab] = useState<'draft' | 'snippets' | 'library'>('draft');

  useEffect(() => {
    // Load brief from sessionStorage
    const stored = sessionStorage.getItem('currentBrief');
    if (!stored) {
      router.push('/brief');
      return;
    }

    try {
      const parsedBrief = JSON.parse(stored);
      setBrief(parsedBrief);
    } catch (error) {
      console.error('Failed to parse brief:', error);
      router.push('/brief');
    }
  }, [router]);

  const handleGenerate = async () => {
    if (!brief) return;

    setIsLoading(true);
    setError('');
    setOutputs(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brief }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const parsed = parseOutputs(data.content);
      setOutputs(parsed);

      // Save brief and draft to database
      await saveToDatabase(brief, parsed);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDatabase = async (brief: Brief, outputs: ParsedOutput) => {
    try {
      // First, save the brief
      const briefResponse = await fetch('/api/briefs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: brief }),
      });

      if (!briefResponse.ok) {
        throw new Error('Failed to save brief');
      }

      const savedBrief = await briefResponse.json();

      // Then, save the draft
      const draftResponse = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief_id: savedBrief.id,
          blog_md: outputs.blogDraft,
          linkedin_txt: outputs.linkedInPost,
          footnotes_md: outputs.footnotes || null,
        }),
      });

      if (!draftResponse.ok) {
        throw new Error('Failed to save draft');
      }

      showToast('Draft saved successfully');
    } catch (err) {
      console.error('Error saving to database:', err);
      // Don't show error to user as the content was generated successfully
    }
  };

  const handleExtractSnippets = async () => {
    if (!brief || !outputs?.blogDraft) return;

    setIsExtractingSnippets(true);
    setError('');

    try {
      const response = await fetch('/api/extract-snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          brief, 
          blogDraft: outputs.blogDraft 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract snippets');
      }

      const data = await response.json();
      setExtractedSnippets(data);
      setActiveTab('snippets');
      showToast('Snippets extracted successfully');
    } catch (err) {
      setError('Failed to extract snippets. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsExtractingSnippets(false);
    }
  };

  const handleBackToBrief = () => {
    router.push('/brief');
  };

  if (!brief) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brief...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Brief */}
          <div className="lg:col-span-1">
            <BriefCard brief={brief} />
            <div className="mt-6">
              <button
                onClick={handleBackToBrief}
                className="w-full px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Back to Brief
              </button>
            </div>
          </div>

          {/* Right Panel - Outputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generate Button */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-black mb-2">Generate Content</h2>
                  <p className="text-gray-600 text-sm">
                    Create blog draft, LinkedIn post, and footnotes based on your brief
                  </p>
                </div>
                <div className="flex gap-3">
                  {outputs && (
                    <button
                      onClick={handleExtractSnippets}
                      disabled={isExtractingSnippets}
                      className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {isExtractingSnippets ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Extracting...
                        </div>
                      ) : (
                        'Extract Snippets'
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Content'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'draft'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Draft Outputs
                </button>
                <button
                  onClick={() => setActiveTab('snippets')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'snippets'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Snippets
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'library'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Library
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'draft' && outputs && (
                  <div className="space-y-6">
                    <OutputSection 
                      title="Blog Draft" 
                      content={outputs.blogDraft}
                      showCopyButton={true}
                      showDownloadButton={true}
                    />
                    <OutputSection 
                      title="LinkedIn Post" 
                      content={outputs.linkedInPost}
                      showCopyButton={true}
                    />
                    {outputs.footnotes && (
                      <OutputSection 
                        title="Footnotes / Sources" 
                        content={outputs.footnotes}
                        showCopyButton={false}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'snippets' && extractedSnippets && brief && outputs && (
                  <SnippetsPanel 
                    snippets={extractedSnippets}
                    brief={brief}
                    blogDraft={outputs.blogDraft}
                  />
                )}

                {activeTab === 'snippets' && !extractedSnippets && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No snippets extracted yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Generate content first, then click "Extract Snippets" to create reusable assets
                    </p>
                  </div>
                )}

                {activeTab === 'library' && (
                  <SnippetLibrary />
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
