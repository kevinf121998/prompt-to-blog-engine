'use client';

import { useRouter } from 'next/navigation';
import BriefForm from '@/components/BriefForm';
import { Brief } from '@/types/brief';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BriefPage() {
  const router = useRouter();

  const handleContinue = (brief: Brief) => {
    // Store brief in sessionStorage for the draft page
    sessionStorage.setItem('currentBrief', JSON.stringify(brief));
    router.push('/draft');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <BriefForm onContinue={handleContinue} />
      </div>
    </ProtectedRoute>
  );
}
