'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BriefCard from '@/components/BriefCard';
import OutputSection from '@/components/OutputSection';
import { Brief } from '@/types/brief';
import { ParsedOutput } from '@/utils/parseOutputs';
import { showToast } from '@/utils/toast';

interface DraftWithBrief {
  id: string;
  blog_md: string;
  linkedin_txt: string;
  footnotes_md: string | null;
  created_at: string;
  updated_at: string;
  briefs: {
    id: string;
    json: Record<string, unknown>;
    created_at: string;
  };
}

export default function DraftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [draft, setDraft] = useState<DraftWithBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      if (params.id) {
        await fetchDraft(params.id as string);
      }
    };
    loadDraft();
  }, [params.id]);

  const fetchDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/drafts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch draft');
      }
      const data = await response.json();
      setDraft(data);
    } catch (err) {
      setError('Failed to load draft');
      console.error('Error fetching draft:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/drafts/${draft.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blog_md: draft.blog_md,
          linkedin_txt: draft.linkedin_txt,
          footnotes_md: draft.footnotes_md,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      showToast('Draft saved successfully');
    } catch (err) {
      setError('Failed to save draft');
      console.error('Error saving draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDrafts = () => {
    router.push('/drafts');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading draft...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !draft) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Draft Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested draft could not be loaded.'}</p>
            <button
              onClick={handleBackToDrafts}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Drafts
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Convert the brief JSON to the Brief type
  const brief: Brief = draft.briefs.json as unknown as Brief;

  // Create parsed outputs for display
  const outputs: ParsedOutput = {
    blogDraft: draft.blog_md,
    linkedInPost: draft.linkedin_txt,
    footnotes: draft.footnotes_md || '',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Draft</h1>
              <p className="text-gray-600">Created {new Date(draft.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDrafts}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Back to Drafts
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Brief */}
            <div className="lg:col-span-1">
              <BriefCard brief={brief} />
            </div>

            {/* Right Panel - Outputs */}
            <div className="lg:col-span-2 space-y-6">
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
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
