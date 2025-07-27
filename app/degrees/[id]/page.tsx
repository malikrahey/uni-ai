"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  Plus,
  Loader,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { DegreeDetailResponse } from '@/types/education';

export default function DegreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const [degreeData, setDegreeData] = useState<DegreeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCourses, setIsGeneratingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const degreeId = params.id as string;

  const fetchDegreeDetail = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/degrees/${degreeId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch degree details');
      }

      const result = await response.json();
      setDegreeData(result);

      // Auto-generate courses if none exist
      if (result.courses.length === 0 && !isGeneratingCourses) {
        await generateCourses();
      }
    } catch (err) {
      console.error('Error fetching degree details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCourses = async () => {
    if (!session?.access_token) return;

    try {
      setIsGeneratingCourses(true);
      console.log('Auto-generating courses for degree:', degreeId);

      const response = await fetch(`/api/degrees/${degreeId}/generate-courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseCount: 8
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate courses');
      }

      const result = await response.json();
      console.log(`Successfully generated ${result.generated} courses`);

      // Refresh degree data to show new courses
      await fetchDegreeDetail();
    } catch (err) {
      console.error('Error generating courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate courses');
    } finally {
      setIsGeneratingCourses(false);
    }
  };

  useEffect(() => {
    if (!session?.access_token || !degreeId) return;
    fetchDegreeDetail();
  }, [session?.access_token, degreeId]);

  if (isLoading && !isGeneratingCourses) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="text-slate-600 dark:text-slate-300">Loading degree details...</span>
        </div>
      </div>
    );
  }

  if (isGeneratingCourses) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Generating Your Courses
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Creating a personalized curriculum for your degree...
          </p>
        </div>
      </div>
    );
  }

  if (error || !degreeData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Degree
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
            {error || 'Degree not found'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Go Back
            </button>
            {error?.includes('generate') && (
              <button
                onClick={generateCourses}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry Generation
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { degree, courses, userProgress } = degreeData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                {degree.icon ? (
                  <span className="text-3xl">{degree.icon}</span>
                ) : (
                  <GraduationCap className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {degree.name}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                  {degree.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/course-creation?degree_id=${degree.id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {courses.length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total Courses
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {userProgress.completedLessons}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Lessons Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {userProgress.progressPercentage}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Overall Progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Degree Progress
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {userProgress.completedLessons} of {userProgress.totalLessons} lessons completed
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${userProgress.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Courses in this Degree
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {course.icon ? (
                        <span className="text-2xl">{course.icon}</span>
                      ) : (
                        <BookOpen className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {course.lessons?.length || 0} lessons
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {course.progress_percentage || 0}% complete
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress_percentage || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Course {index + 1} of {courses.length}</span>
                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No courses yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start building your degree by adding your first course.
            </p>
            <button
              onClick={() => router.push(`/course-creation?degree_id=${degree.id}`)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Course</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 