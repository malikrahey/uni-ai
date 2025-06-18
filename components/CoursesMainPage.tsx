"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useHomeContent } from '@/hooks/useHomeContent';
import { DegreeCard } from './DegreeCard';
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
  const { degrees, standaloneCourses, userProgress, isLoading, error, refetch } = useHomeContent();
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

  // // Check database setup
  // const checkDatabaseSetup = async () => {
  //   try {
  //     const response = await fetch('/api/setup-db');
  //     const data = await response.json();
  //     console.log('Database Setup Response:', data);
  //     setDbSetupInfo(data);
  //   } catch (error) {
  //     console.error('Database setup check failed:', error);
  //   }
  // };

  // Test auth and db setup on component mount
  useEffect(() => {
    if (user) {
      testAuth();
      // checkDatabaseSetup();
    }
  }, [user, session]);

  // Filter content based on search term
  const filteredDegrees = degrees.filter(degree =>
    degree.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    degree.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = standaloneCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Content
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
              onClick={() => refetch()}
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
            {/* <button
              onClick={checkDatabaseSetup}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Database className="h-4 w-4 inline mr-2" />
              Check DB
            </button> */}
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
                    degrees.length
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Degrees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? (
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    standaloneCourses.length
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? (
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    userProgress.totalLessonsCompleted
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="relative flex-1 max-w-md mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search degrees and courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <Link
              href="/course-creation"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-slate-600 dark:text-slate-300">Loading your content...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {/* Degrees Section */}
            {filteredDegrees.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <GraduationCap className="h-6 w-6 mr-2 text-primary" />
                    Degrees
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredDegrees.length} degree{filteredDegrees.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDegrees.map((degree) => (
                    <DegreeCard key={degree.id} degree={degree} />
                  ))}
                </div>
              </section>
            )}

            {/* Standalone Courses Section */}
            {filteredCourses.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <BookOpen className="h-6 w-6 mr-2 text-primary" />
                    Individual Courses
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
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
                            {course.lesson_count || 0} lessons
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
                        <span>Click to view lessons</span>
                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredDegrees.length === 0 && filteredCourses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? 'No results found' : 'Start your learning journey'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `No degrees or courses match "${searchTerm}". Try adjusting your search.`
                    : 'Create your first degree or course to begin organizing your academic journey.'
                  }
                </p>
                <Link
                  href="/course-creation"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Course</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 