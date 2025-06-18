import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { CourseDetailResponse } from '@/types/education';

export function useCourseDetail(courseId: string) {
  const { session } = useAuth();
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseDetail = async () => {
    if (!session?.access_token || !courseId) {
      setError('No authentication token available or course ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch course details');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [session?.access_token, courseId]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchCourseDetail
  };
} 