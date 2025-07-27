import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAutoGeneration() {
  const { session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generateCourses = async (degreeId: string, options: { courseCount?: number } = {}) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch(`/api/degrees/${degreeId}/generate-courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseCount: options.courseCount || 8
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate courses');
      }

      const result = await response.json();
      console.log(`Successfully generated ${result.generated} courses`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLessons = async (courseId: string, options: { lessonCount?: number } = {}) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/generate-lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonCount: options.lessonCount || 12
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lessons');
      }

      const result = await response.json();
      console.log(`Successfully generated ${result.generated} lessons`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async (lessonId: string, options: { forceRegenerate?: boolean } = {}) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceRegenerate: options.forceRegenerate || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      console.log(`Successfully generated content for lesson`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTest = async (lessonId: string) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/generate-test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate test');
      }

      const result = await response.json();
      console.log(`Successfully generated test for lesson`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setGenerationError(null);
  };

  return {
    isGenerating,
    generationError,
    generateCourses,
    generateLessons,
    generateContent,
    generateTest,
    clearError
  };
} 