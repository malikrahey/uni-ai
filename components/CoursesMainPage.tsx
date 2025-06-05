"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  GraduationCap,
  Calendar,
  TrendingUp,
  Target,
  Search,
  Filter,
  AlertCircle,
  Loader,
  RefreshCw,
  Database
} from 'lucide-react';
import Link from 'next/link';

export default function CoursesMainPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const { courses, isLoading, error } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [dbSetupInfo, setDbSetupInfo] = useState<any>(null);

  // Debug function to test authentication
  const testAuth = async () => {
    try {
      console.log('Frontend Debug - User:', user);
      console.log('Frontend Debug - Session:', session);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Adding auth header with token');
      }
      
      const response = await fetch('/api/test-auth', { headers });
      const data = await response.json();
      console.log('Auth Test Response:', data);
      setDebugInfo(data);
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  // Check database setup
  const checkDatabaseSetup = async () => {
    try {
      const response = await fetch('/api/setup-db');
      const data = await response.json();
      console.log('Database Setup Response:', data);
      setDbSetupInfo(data);
    } catch (error) {
      console.error('Database setup check failed:', error);
    }
  };

  // Test auth and db setup on component mount
  useEffect(() => {
    if (user) {
      testAuth();
      checkDatabaseSetup();
    }
  }, [user, session]);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate aggregate stats
  const totalCourses = courses.reduce((sum, course) => sum + course.totalCourses, 0);
  const avgProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Courses
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
            {error}
          </p>
          
          {/* Debug Info */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
              <div className="font-semibold mb-2">Auth Debug:</div>
              <div>Has User: {debugInfo.hasUser ? 'Yes' : 'No'}</div>
              <div>Has Session: {debugInfo.hasSession ? 'Yes' : 'No'}</div>
              <div>Has Token: {session?.access_token ? 'Yes' : 'No'}</div>
              <div>Token Length: {debugInfo.tokenLength || 'N/A'}</div>
              {debugInfo.userError && <div>User Error: {debugInfo.userError}</div>}
              {debugInfo.sessionError && <div>Session Error: {debugInfo.sessionError}</div>}
            </div>
          )}

          {/* Database Setup Info */}
          {dbSetupInfo && (
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-left">
              <div className="font-semibold mb-2">Database Status:</div>
              <div>Tables Exist: {dbSetupInfo.tablesExist ? 'Yes' : 'No'}</div>
              {dbSetupInfo.missingTables && dbSetupInfo.missingTables.length > 0 && (
                <div>Missing Tables: {dbSetupInfo.missingTables.join(', ')}</div>
              )}
              {dbSetupInfo.message && <div>Message: {dbSetupInfo.message}</div>}
              {dbSetupInfo.setupInstructions && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <strong>Setup Required:</strong><br />
                  {dbSetupInfo.setupInstructions}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry
            </button>
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Test Auth
            </button>
            <button
              onClick={checkDatabaseSetup}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Database className="h-4 w-4 inline mr-2" />
              Check DB
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header Section */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.email?.split('@')[0]}! 🎓
              </h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                Continue your academic journey with UniAi
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 md:mt-0 flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? (
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    courses.length
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Active Degrees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? (
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    totalCourses
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? (
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    `${avgProgress}%`
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-neutral-dark text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-neutral-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-darker transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && courses.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading your courses...</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {!isLoading || courses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Create New Course Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="lg:col-span-1 cursor-pointer"
              onClick={() => router.push('/course-creation')}
            >
              <div className="h-full p-6 border-2 border-dashed border-primary/30 dark:border-primary/50 rounded-xl bg-primary/5 dark:bg-primary/10 hover:border-primary/50 dark:hover:border-primary/70 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="w-16 h-16 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Create New Degree Plan
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Start your journey with AI-powered course planning
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Existing Courses */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Course Header with Gradient */}
                      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-white font-semibold text-lg truncate">
                            {course.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {course.university}
                          </p>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Progress
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {course.completedCourses}/{course.totalCourses} courses
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {course.degree_type}
                            </span>
                          </div>
                        </div>

                        {/* Course Description */}
                        {course.description && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                        )}

                        {/* Last Updated */}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated {new Date(course.updated_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            On track
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && courses.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
              No courses yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Create your first degree plan to get started with UniAi.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/course-creation')}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Degree Plan
            </motion.button>
          </div>
        )}

        {/* Search Results Empty State */}
        {!isLoading && filteredCourses.length === 0 && searchTerm && courses.length > 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your search terms or create a new degree plan.
            </p>
          </div>
        )}

        {/* Quick Actions Section */}
        {!isLoading && courses.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-neutral-dark rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/lessons')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Browse Lessons
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Access AI-generated content
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-neutral-dark rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/tests')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Practice Tests
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Test your knowledge
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-neutral-dark rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/study-groups')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Study Groups
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connect with peers
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, Alex!
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Continue your learning journey
              </p>
            </div>
            <Link
              href="/course-creation"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Learning Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 