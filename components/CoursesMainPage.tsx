"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useHomeContent } from '@/hooks/useHomeContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { DegreeCard } from './DegreeCard';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  GraduationCap,
  TrendingUp,
  Search,
  Filter,
  AlertCircle,
  Loader,
  RefreshCw,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function CoursesMainPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { degrees, standaloneCourses, userProgress, isLoading, error, refetch } = useHomeContent();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { isInTrial, isLoading: trialLoading } = useTrialStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Check if user has access to create content (active subscription or valid trial)
  const hasCreateAccess = subscription || isInTrial;
  const isCheckingAccess = subscriptionLoading || trialLoading;

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
          
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry
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
                Continue your academic journey with Acceluni
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
            
            {isCheckingAccess ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Checking access...</span>
              </div>
            ) : hasCreateAccess ? (
              <Link
                href="/course-creation"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create New</span>
              </Link>
            ) : (
              <div className="group relative">
                <button
                  disabled
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed"
                  title="Subscription required to create new content"
                >
                  <Lock className="h-4 w-4" />
                  <span>Create New</span>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="relative">
                    Subscription required to create new content
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
                  </div>
                </div>
              </div>
            )}
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
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words line-clamp-2">
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
                {isCheckingAccess ? (
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Checking access...</span>
                  </div>
                ) : hasCreateAccess ? (
                  <Link
                    href="/course-creation"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Course</span>
                  </Link>
                ) : (
                  <div className="group relative inline-block">
                    <button
                      disabled
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed"
                      title="Subscription required to create new content"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Create Your First Course</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="relative">
                        Subscription required to create new content
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 