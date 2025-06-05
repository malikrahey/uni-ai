"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  Play,
  CheckCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Course } from '@/hooks/useCourses';
import { useCourses } from '@/hooks/useCourses';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { getCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      setIsLoading(true);
      try {
        const courseData = await getCourse(courseId);
        if (courseData) {
          setCourse(courseData);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Course Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'The course you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {course.university} • {course.degree_type}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Course Overview
              </h2>
              
              {course.description ? (
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {course.description}
                </p>
              ) : (
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Welcome to your personalized learning journey! This course has been tailored 
                  specifically for your learning goals and current knowledge level.
                </p>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Overall Progress
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.totalCourses}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Subjects
                  </div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.completedCourses}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Completed
                  </div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.duration_years}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Duration (Years)
                  </div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.progress}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Progress
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Coming Soon Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                🚀 Coming Soon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Play className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Interactive Lessons
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      AI-generated content tailored to your level
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Practice Tests
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Adaptive assessments and quizzes
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Study Groups
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Connect with fellow learners
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Schedule Planning
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Personalized study schedules
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-3">
                  <Play className="h-5 w-5" />
                  Start Learning (Coming Soon)
                </button>
                
                <button className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                  <Target className="h-5 w-5" />
                  Take Assessment (Coming Soon)
                </button>
                
                <button className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  Find Study Partners (Coming Soon)
                </button>
              </div>
            </motion.div>

            {/* Course Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Course Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Created:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(course.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {course.start_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Start Date:</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(course.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {course.target_graduation_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Target Completion:</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(course.target_graduation_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 