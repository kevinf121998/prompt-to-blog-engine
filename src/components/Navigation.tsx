'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link 
            href="/brief" 
            className={`text-sm font-medium transition-colors ${
              isActive('/brief') 
                ? 'text-black' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Brief
          </Link>
          <Link 
            href="/drafts" 
            className={`text-sm font-medium transition-colors ${
              isActive('/drafts') 
                ? 'text-black' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Drafts
          </Link>
          <span className="text-sm font-medium text-gray-400 cursor-not-allowed">
            Snippets
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-black">
            Prompt-to-Blog Engine
          </h1>
          
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
