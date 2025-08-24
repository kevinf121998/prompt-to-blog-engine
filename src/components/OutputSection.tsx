'use client';

import { useState } from 'react';
import { getWordCount, getReadingTime } from '@/utils/textProcessing';

interface OutputSectionProps {
  title: string;
  content: string;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
}

export default function OutputSection({ 
  title, 
  content, 
  showCopyButton = true, 
  showDownloadButton = false
}: OutputSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  if (!content.trim()) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">{title}</h2>
        <div className="flex items-center gap-2">
          {showCopyButton && (
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          {showDownloadButton && (
            <button
              onClick={downloadAsMarkdown}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              Download .md
            </button>
          )}
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed select-text">
          {content}
        </div>
      </div>
      
      {/* Inline metrics */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Word count: {getWordCount(content)}</div>
          {title === 'Blog Draft' && (
            <div>Reading time: ~{getReadingTime(getWordCount(content))} min</div>
          )}
        </div>
      </div>
    </div>
  );
}
