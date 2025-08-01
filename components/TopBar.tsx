'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { FaGraduationCap } from 'react-icons/fa6';
// import { supabase } from '@/utils/supabase';

// TopBar component handles user profile display and navigation
export default function TopBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { isInTrial } = useTrialStatus();

  // State for tracking logout process
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user logout with error handling and loading state
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setIsDropdownOpen(false);
      setIsLoggingOut(false);
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-md sm:text-lg font-medium text-slate-700 dark:text-slate-200 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <FaGraduationCap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl text-slate-800 dark:text-slate-100">Acceluni</span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              {/* Show login button for unauthenticated users */}
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-full transition-colors shadow-subtle hover:shadow-hover"
              >
                Sign in
              </Link>
            </>
          ) : (
            // Show subscription and profile for authenticated users
            <>
              {!isLoadingSubscription && (!isInTrial) && (
                !subscription || 
                subscription.status === 'canceled' || 
                (subscription.cancel_at_period_end && new Date(subscription.current_period_end) > new Date())
              ) && (
                <button
                  onClick={() => router.push('/profile')}
                  className="hidden sm:block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors shadow-subtle hover:shadow-hover"
                >
                  Upgrade Plan
                </button>
              )}

              {!isLoadingSubscription && (
                subscription || isInTrial
              ) && pathname !== '/' && (
                <button
                  onClick={() => router.push('/')}
                  className="hidden sm:block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors shadow-subtle hover:shadow-hover"
                >
                  {isInTrial ? "Start Learning" : "My Courses"}
                </button>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-neutral-darker/10 dark:hover:bg-neutral-darker/50 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-lg shadow-hover py-1 z-[60] border border-gray-200 dark:border-gray-700">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-neutral dark:hover:bg-neutral-dark hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDropdownOpen(false);
                        window.location.href = '/profile';
                      }}
                    >
                      Profile & Subscription
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-neutral dark:hover:bg-neutral-dark disabled:opacity-50"
                    >
                      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 