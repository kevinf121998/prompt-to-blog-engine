import { Brief } from '@/types/brief';

interface BriefCardProps {
  brief: Brief;
}

export default function BriefCard({ brief }: BriefCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-2">Content Brief</h2>
        <p className="text-gray-600 text-sm">Your content strategy and requirements</p>
      </div>

      <div className="space-y-6">
        {/* Problem */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Problem Statement</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{brief.problem}</p>
        </div>

        {/* Audience */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Target Audience</h3>
          <p className="text-gray-700 text-sm">{brief.audience}</p>
        </div>

        {/* POV Bullets */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Point of View</h3>
          <ul className="space-y-2">
            {brief.povBullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gray-400 text-xs mt-1">•</span>
                <span className="text-gray-700 text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence */}
        {brief.evidence.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-black mb-2">Evidence & Sources</h3>
            <ul className="space-y-1">
              {brief.evidence.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs mt-1">•</span>
                  <span className="text-gray-700 text-sm">
                    {item.startsWith('http') ? (
                      <a 
                        href={item} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {item}
                      </a>
                    ) : (
                      item
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Call to Action</h3>
          <p className="text-gray-700 text-sm">{brief.cta}</p>
        </div>

        {/* Tone */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">Content Tone</h3>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {brief.tone}
          </span>
        </div>
      </div>
    </div>
  );
}
