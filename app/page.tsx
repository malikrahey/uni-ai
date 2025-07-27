"use client";

import { useAuth } from '@/contexts/AuthContext';
import CoursesMainPage from '@/components/CoursesMainPage';
import LandingPage from '@/components/LandingPage';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col space-y-4 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div>Loading UniAi...</div>
      </div>
    );
  }

  // If user is authenticated, show courses page
  if (user) {
    return <CoursesMainPage />;
  }

  // If user is not authenticated, show landing page
  return <LandingPage />;
}

