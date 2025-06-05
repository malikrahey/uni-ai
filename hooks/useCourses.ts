import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Course {
  id: string;
  title: string;
  university: string;
  degree_type: string;
  duration_years: number;
  start_date: string;
  target_graduation_date?: string;
  description?: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
  created_at: string;
  updated_at: string;
  course_subjects?: CourseSubject[];
}

export interface CourseSubject {
  id: string;
  subject_name: string;
  credits: number;
  completed: boolean;
  semester: number;
  description?: string;
  prerequisites?: string[];
  created_at: string;
}

export interface CreateCourseData {
  title: string;
  university: string;
  degree_type: string;
  duration_years?: number;
  start_date?: string;
  target_graduation_date?: string;
  description?: string;
}

export interface UpdateCourseData {
  title?: string;
  university?: string;
  degree_type?: string;
  duration_years?: number;
  start_date?: string;
  target_graduation_date?: string;
  description?: string;
}

export function useCourses() {
  const { user, session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get headers for authenticated requests
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  };

  // Fetch all courses for the user
  const fetchCourses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }

      setCourses(data.courses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new course
  const createCourse = async (courseData: CreateCourseData): Promise<Course | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      const newCourse = data.course;
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating course:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific course
  const getCourse = async (courseId: string): Promise<Course | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course');
      }

      return data.course;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching course:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a course
  const updateCourse = async (courseId: string, updateData: UpdateCourseData): Promise<Course | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }

      const updatedCourse = data.course;
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, ...updatedCourse } : course
      ));
      return updatedCourse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating course:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }

      setCourses(prev => prev.filter(course => course.id !== courseId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting course:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses when user changes
  useEffect(() => {
    if (user && session) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [user, session]);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    createCourse,
    getCourse,
    updateCourse,
    deleteCourse,
    // Helper functions
    refreshCourses: fetchCourses,
    clearError: () => setError(null),
  };
} 