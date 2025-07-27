"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  FileText,
  Play,
  Loader,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { CourseDetailResponse } from '@/types/education';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const { generateLessons, isGenerating } = useAutoGeneration();
  const [courseData, setCourseData] = useState<CourseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = params.id as string;

  const fetchCourseDetail = async () => {
    if (!session?.access_token) return;
    
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
      setCourseData(result);

      // Auto-generate lessons if none exist
      if (result.lessons.length === 0 && !isGenerating) {
        await handleGenerateLessons();
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLessons = async () => {
    try {
      console.log('Auto-generating lessons for course:', courseId);
      
      await generateLessons(courseId, { lessonCount: 12 });
      
      // Refresh course data to show new lessons
      await fetchCourseDetail();
    } catch (err) {
      console.error('Error generating lessons:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate lessons');
    }
  };

  useEffect(() => {
    if (!session?.access_token || !courseId) return;
    fetchCourseDetail();
  }, [session?.access_token, courseId]);

  if (isLoading && !isGenerating) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="text-slate-600 dark:text-slate-300">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Generating Your Lessons
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Creating a personalized curriculum for your course...
          </p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Course
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
            {error || 'Course not found'}
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
                onClick={handleGenerateLessons}
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

  const { course, lessons, userProgress } = courseData;

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
                {course.icon ? (
                  <span className="text-3xl">{course.icon}</span>
                ) : (
                  <BookOpen className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {course.name}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                  {course.description}
                </p>
                
                {course.degree_id && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Part of a degree program
                    </span>
                  </div>
                )}
              </div>
            </div>

            {lessons && lessons.length === 0 && (
              <button
                onClick={handleGenerateLessons}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Lessons</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {lessons?.length || 0}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total Lessons
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {userProgress?.completedLessons || 0}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {userProgress?.progressPercentage || 0}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Course Progress
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {userProgress?.completedLessons || 0} of {userProgress?.totalLessons || 0} lessons completed
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${userProgress?.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course Lessons
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {lessons?.length || 0} lesson{(lessons?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {lessons && lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const isCompleted = lesson.user_progress?.completed || false;
              const hasTest = lesson.test != null;
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/lessons/${lesson.id}`)}
                  className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Lesson Number */}
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      
                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {lesson.name}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {lesson.description}
                        </p>
                        
                        {/* Lesson Meta */}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <FileText className="h-3 w-3" />
                            <span>Content</span>
                          </div>
                          {hasTest && (
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>Test Available</span>
                            </div>
                          )}
                          {lesson.user_progress?.test_score && (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Score: {lesson.user_progress.test_score}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {isCompleted ? 'Completed' : 'Not Started'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Lesson {index + 1} of {lessons.length}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Play className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No lessons yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Generate lessons automatically using AI to start your learning journey.
            </p>
            <button
              onClick={handleGenerateLessons}
              disabled={isGenerating}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Generating Lessons...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Lessons</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 