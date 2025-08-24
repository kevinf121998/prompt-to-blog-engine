'use client';

import { useState, useEffect } from 'react';
import { Brief, BriefValidation, ToneType } from '@/types/brief';
import { saveBriefToStorage, getBriefFromStorage, clearBriefFromStorage } from '@/utils/localStorage';

interface BriefFormProps {
  onContinue: (brief: Brief) => void;
}

const TONE_OPTIONS: { value: ToneType; label: string; desc: string }[] = [
  { value: 'Professional', label: 'Professional', desc: 'Polished, formal but approachable' },
  { value: 'Conversational', label: 'Conversational', desc: 'Clear, human, lightly informal' },
  { value: 'Thought Leadership', label: 'Thought Leadership', desc: 'Authoritative, visionary, provocative' },
  { value: 'Playful', label: 'Playful', desc: 'Light-hearted, witty, still insightful' }
];

export default function BriefForm({ onContinue }: BriefFormProps) {
  const [brief, setBrief] = useState<Brief>({
    problem: '',
    audience: '',
    povBullets: ['', '', ''],
    evidence: [],
    cta: '',
    tone: 'Professional'
  });

  const [validation, setValidation] = useState<BriefValidation>({
    problem: false,
    audience: false,
    povBullets: false,
    cta: false,
    tone: true,
    isValid: false
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = getBriefFromStorage();
    if (saved) {
      setBrief(saved);
      validateBrief(saved);
    }
  }, []);

  // Autosave on brief change
  useEffect(() => {
    saveBriefToStorage(brief);
    validateBrief(brief);
  }, [brief]);

  const validateBrief = (currentBrief: Brief) => {
    const nonEmptyPovBullets = currentBrief.povBullets.filter(bullet => bullet.trim().length > 0);
    
    const newValidation: BriefValidation = {
      problem: currentBrief.problem.trim().length > 0,
      audience: currentBrief.audience.trim().length > 0,
      povBullets: nonEmptyPovBullets.length >= 3,
      cta: currentBrief.cta.trim().length > 0,
      tone: true, // Always valid since it's a select
      isValid: false
    };
    
    newValidation.isValid = newValidation.problem && 
                           newValidation.audience && 
                           newValidation.povBullets && 
                           newValidation.cta && 
                           newValidation.tone;
    
    setValidation(newValidation);
  };

  const updateBrief = (updates: Partial<Brief>) => {
    setBrief(prev => ({ ...prev, ...updates }));
  };

  const addPovBullet = () => {
    setBrief(prev => ({
      ...prev,
      povBullets: [...prev.povBullets, '']
    }));
  };

  const updatePovBullet = (index: number, value: string) => {
    setBrief(prev => ({
      ...prev,
      povBullets: prev.povBullets.map((bullet, i) => i === index ? value : bullet)
    }));
  };

  const removePovBullet = (index: number) => {
    if (brief.povBullets.length <= 3) return; // Keep minimum 3
    setBrief(prev => ({
      ...prev,
      povBullets: prev.povBullets.filter((_, i) => i !== index)
    }));
  };

  const addEvidence = () => {
    setBrief(prev => ({
      ...prev,
      evidence: [...prev.evidence, '']
    }));
  };

  const updateEvidence = (index: number, value: string) => {
    setBrief(prev => ({
      ...prev,
      evidence: prev.evidence.map((item, i) => i === index ? value : item)
    }));
  };

  const removeEvidence = (index: number) => {
    setBrief(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleClear = () => {
    setBrief({
      problem: '',
      audience: '',
      povBullets: ['', '', ''],
      evidence: [],
      cta: '',
      tone: 'Professional'
    });
    clearBriefFromStorage();
  };

  const handleContinue = () => {
    if (validation.isValid) {
      // Clean up empty povBullets and evidence
      const cleanBrief = {
        ...brief,
        povBullets: brief.povBullets.filter(bullet => bullet.trim().length > 0),
        evidence: brief.evidence.filter(item => item.trim().length > 0)
      };
      onContinue(cleanBrief);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
          Content Brief
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed font-light">
          Define your content strategy with a structured brief that ensures consistent, high-quality outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Problem */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Problem Statement *
            </label>
            <textarea
              value={brief.problem}
              onChange={(e) => updateBrief({ problem: e.target.value })}
              placeholder="Describe the core problem or challenge your content addresses..."
              className={`w-full h-24 p-4 border rounded-lg resize-none transition-colors ${
                brief.problem.trim() ? 'border-gray-300 focus:border-black' : 'border-red-300 focus:border-red-500'
              }`}
            />
            {!validation.problem && brief.problem.trim() === '' && (
              <p className="text-red-600 text-sm mt-2">Problem statement is required</p>
            )}
          </div>

          {/* Audience */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Target Audience *
            </label>
            <input
              type="text"
              value={brief.audience}
              onChange={(e) => updateBrief({ audience: e.target.value })}
              placeholder="e.g., CIOs in energy retail, transformation leaders"
              className={`w-full p-4 border rounded-lg transition-colors ${
                brief.audience.trim() ? 'border-gray-300 focus:border-black' : 'border-red-300 focus:border-red-500'
              }`}
            />
            {!validation.audience && brief.audience.trim() === '' && (
              <p className="text-red-600 text-sm mt-2">Target audience is required</p>
            )}
          </div>

          {/* CTA */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Call to Action *
            </label>
            <input
              type="text"
              value={brief.cta}
              onChange={(e) => updateBrief({ cta: e.target.value })}
              placeholder="e.g., Book a discovery call, Download the guide"
              className={`w-full p-4 border rounded-lg transition-colors ${
                brief.cta.trim() ? 'border-gray-300 focus:border-black' : 'border-red-300 focus:border-red-500'
              }`}
            />
            {!validation.cta && brief.cta.trim() === '' && (
              <p className="text-red-600 text-sm mt-2">Call to action is required</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* POV Bullets */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Point of View Bullets * (min 3)
            </label>
            <div className="space-y-3">
              {brief.povBullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updatePovBullet(index, e.target.value)}
                    placeholder={`POV bullet ${index + 1}...`}
                    className={`flex-1 p-3 border rounded-lg transition-colors ${
                      bullet.trim() ? 'border-gray-300 focus:border-black' : 'border-red-300 focus:border-red-500'
                    }`}
                  />
                  {brief.povBullets.length > 3 && (
                    <button
                      onClick={() => removePovBullet(index)}
                      className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPovBullet}
                className="w-full p-3 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                + Add bullet
              </button>
            </div>
            {!validation.povBullets && (
              <p className="text-red-600 text-sm mt-2">At least 3 POV bullets are required</p>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Evidence & Sources (optional)
            </label>
            <div className="space-y-3">
              {brief.evidence.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateEvidence(index, e.target.value)}
                    placeholder="URL or reference..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeEvidence(index)}
                    className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addEvidence}
                className="w-full p-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                + Add evidence
              </button>
            </div>
          </div>

          {/* Tone */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-black mb-3">
              Content Tone *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateBrief({ tone: option.value })}
                  className={`p-4 text-left rounded-lg border transition-all duration-200 ${
                    brief.tone === option.value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className={`text-xs mt-1 ${
                    brief.tone === option.value ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={handleClear}
          className="px-6 py-4 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Clear brief
        </button>
        <button
          onClick={handleContinue}
          disabled={!validation.isValid}
          className="flex-1 lg:flex-none bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Continue to Draft
        </button>
      </div>
    </div>
  );
}
