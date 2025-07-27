import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { HomeContentResponse } from '@/types/education';

export function useHomeContent() {
  const { session } = useAuth();
  const [data, setData] = useState<HomeContentResponse>({
    degrees: [],
    standaloneCourses: [],
    userProgress: {
      totalLessonsCompleted: 0,
      totalTestsCompleted: 0,
      averageTestScore: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeContent = async () => {
    if (!session?.access_token) {
      setError('No authentication token available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/home-content', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch home content');
      }

      const result = await response.json();
      setData({
        degrees: result.degrees || [],
        standaloneCourses: result.standaloneCourses || [],
        userProgress: result.userProgress || {
          totalLessonsCompleted: 0,
          totalTestsCompleted: 0,
          averageTestScore: 0
        }
      });
    } catch (err) {
      console.error('Error fetching home content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeContent();
  }, [session?.access_token]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchHomeContent
  };
} 