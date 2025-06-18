"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Play,
  Award,
  FileText,
  Target,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Send
} from 'lucide-react';
import type { Lesson, TestAnswer, TestResult, Question } from '@/types/education';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const { isGenerating, generationError, generateContent, generateTest, clearError } = useAutoGeneration();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [autoGenerationTriggered, setAutoGenerationTriggered] = useState(false);
  const [generationType, setGenerationType] = useState<'content' | 'test' | null>(null);
  
  // Test-related state
  const [isTestExpanded, setIsTestExpanded] = useState(false);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const lessonId = params.id as string;

  const fetchLessonDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lesson details');
      }

      const result = await response.json();
      console.log('Fetched lesson data:', {
        lessonId: result.lesson?.id,
        hasTest: !!result.lesson?.test,
        testId: result.lesson?.test?.id,
        testQuestions: result.lesson?.test?.questions?.length || 0,
        testData: result.lesson?.test
      });
      setLesson(result.lesson);
      return result.lesson;
    } catch (err) {
      console.error('Error fetching lesson details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAutoGeneration = async (lessonData: Lesson) => {
    if (autoGenerationTriggered || isGenerating) return;

    // Check if content is empty or minimal
    const isEmpty = !lessonData.content || 
                   lessonData.content.trim().length < 100 || 
                   lessonData.content.includes('Content not available');

    // Check if test is missing
    const hasNoTest = !lessonData.test || 
                     !lessonData.test.questions || 
                     lessonData.test.questions.length === 0;

    console.log('Auto-generation check:', {
      isEmpty,
      hasNoTest,
      hasContent: !!lessonData.content,
      contentLength: lessonData.content?.length || 0,
      hasTest: !!lessonData.test,
      testQuestions: lessonData.test?.questions?.length || 0,
      willTrigger: isEmpty || hasNoTest
    });

    if (isEmpty || hasNoTest) {
      setAutoGenerationTriggered(true);
      try {
        if (isEmpty) {
          // Generate full content including test
          console.log('Triggering content generation...');
          setGenerationType('content');
          await generateContent(lessonId);
        } else if (hasNoTest) {
          // Generate only the test
          console.log('Triggering test generation...');
          setGenerationType('test');
          await generateTest(lessonId);
        }
        // Wait a moment for database operations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Refetch the lesson data after generation
        const updatedLesson = await fetchLessonDetail();
        if (updatedLesson) {
          setLesson(updatedLesson);
          console.log('Updated lesson after generation:', {
            hasTest: !!updatedLesson.test,
            testQuestions: updatedLesson.test?.questions?.length || 0
          });
        }
      } catch (error) {
        console.error('Auto-generation failed:', error);
      } finally {
        setGenerationType(null);
      }
    }
  };

  useEffect(() => {
    if (!session?.access_token || !lessonId) return;

    const loadLesson = async () => {
      const lessonData = await fetchLessonDetail();
      if (lessonData) {
        // Trigger auto-generation if content is empty
        await triggerAutoGeneration(lessonData);
      }
    };

    loadLesson();
  }, [session?.access_token, lessonId]);

  const markLessonComplete = async () => {
    if (!lesson || !session?.access_token) return;

    try {
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Simply reload to get updated data rather than complex state manipulation
        window.location.reload();
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const handleRegenerateContent = async () => {
    if (!lesson || isGenerating) return;
    
    clearError();
    setGenerationType('content');
    try {
      await generateContent(lessonId, { forceRegenerate: true });
      // Wait a moment for database operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refetch the lesson data after regeneration
      const updatedLesson = await fetchLessonDetail();
      if (updatedLesson) {
        setLesson(updatedLesson);
        console.log('Updated lesson after regeneration:', {
          hasTest: !!updatedLesson.test,
          testQuestions: updatedLesson.test?.questions?.length || 0
        });
      }
    } catch (error) {
      console.error('Content regeneration failed:', error);
    } finally {
      setGenerationType(null);
    }
  };

  const handleRegenerateTest = async () => {
    if (!lesson || isGenerating) return;
    
    clearError();
    setGenerationType('test');
    try {
      await generateTest(lessonId);
      // Wait a moment for database operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refetch the lesson data after regeneration
      const updatedLesson = await fetchLessonDetail();
      if (updatedLesson) {
        setLesson(updatedLesson);
        console.log('Updated lesson test after regeneration:', {
          hasTest: !!updatedLesson.test,
          testQuestions: updatedLesson.test?.questions?.length || 0
        });
      }
    } catch (error) {
      console.error('Test regeneration failed:', error);
    } finally {
      setGenerationType(null);
    }
  };

  // Test handling functions
  const initializeTestAnswers = () => {
    if (!lesson?.test?.questions) return;
    
    const answers = lesson.test.questions.map((_, index) => ({
      questionIndex: index,
      answer: ''
    }));
    setTestAnswers(answers);
  };

  const handleTestAnswerChange = (questionIndex: number, answer: number | string) => {
    setTestAnswers(prev => prev.map(a => 
      a.questionIndex === questionIndex 
        ? { ...a, answer } 
        : a
    ));
  };

  const submitTest = async () => {
    if (!lesson?.test || !session?.access_token) return;
    
    setIsSubmittingTest(true);
    setTestError(null);
    
    try {
      const response = await fetch(`/api/tests/${lesson.test.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: testAnswers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit test');
      }

      const result = await response.json();
      setTestResult(result.result);
      
      // Refresh lesson data to get updated progress
      const updatedLesson = await fetchLessonDetail();
      if (updatedLesson) {
        setLesson(updatedLesson);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setTestError(error instanceof Error ? error.message : 'Failed to submit test');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const resetTest = () => {
    setTestResult(null);
    setTestError(null);
    initializeTestAnswers();
    setIsTestExpanded(true);
  };

  // Initialize test answers when lesson loads or test section expands
  useEffect(() => {
    if (lesson?.test && isTestExpanded && testAnswers.length === 0) {
      initializeTestAnswers();
    }
  }, [lesson?.test, isTestExpanded]);

  // Auto-expand test if user has taken it before
  useEffect(() => {
    if (lesson?.user_progress?.test_score !== undefined) {
      setIsTestExpanded(true);
    }
  }, [lesson?.user_progress]);

  // Loading state
  if (isLoading || (isGenerating && !lesson)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {isGenerating ? (
              <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            ) : (
              <Loader className="h-8 w-8 animate-spin text-primary" />
            )}
            <span className="text-slate-600 dark:text-slate-300">
              {isGenerating ? 'Generating lesson content...' : 'Loading lesson...'}
            </span>
          </div>
          {isGenerating && (
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              AI is creating personalized content and test questions for this lesson. This may take a moment.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Lesson
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
            {error || 'Lesson not found'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = lesson.user_progress?.completed || false;
  const hasTest = lesson.test != null;
  const testScore = lesson.user_progress?.test_score;
  const isEmpty = !lesson.content || 
                 lesson.content.trim().length < 100 || 
                 lesson.content.includes('Content not available');
  const hasNoTest = !lesson.test || 
                   !lesson.test.questions || 
                   lesson.test.questions.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Course</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                {lesson.icon ? (
                  <span className="text-3xl">{lesson.icon}</span>
                ) : (
                  <BookOpen className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {lesson.name}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                  {lesson.description}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                  {testScore && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Test Score: {testScore}%</span>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex items-center space-x-2 text-primary">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-medium">
                        {generationType === 'content' 
                          ? 'Generating content...' 
                          : generationType === 'test' 
                            ? 'Generating test...' 
                            : 'Generating...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isEmpty && (
                <button
                  onClick={handleRegenerateContent}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              )}
              {!isEmpty && hasNoTest && (
                <button
                  onClick={handleRegenerateTest}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Target className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate Test</span>
                </button>
              )}
              {!isEmpty && hasTest && (
                <button
                  onClick={handleRegenerateTest}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <Target className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Test</span>
                </button>
              )}
              {!isCompleted && !isEmpty && (
                <button
                  onClick={markLessonComplete}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Lesson Content
                  </h2>
                </div>
                {generationError && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Generation failed</span>
                  </div>
                )}
              </div>

              {/* Content Display */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Sparkles className="h-12 w-12 animate-pulse text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {generationType === 'content' 
                        ? 'Creating Your Lesson' 
                        : generationType === 'test' 
                          ? 'Creating Test Questions' 
                          : 'Creating Content'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                      {generationType === 'content' 
                        ? 'Our AI is crafting personalized content for this lesson. This includes comprehensive material and practice questions.'
                        : generationType === 'test' 
                          ? 'Our AI is creating personalized test questions based on the lesson content.'
                          : 'Our AI is working on your lesson content.'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <AlertCircle className="h-12 w-12 text-orange-500" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Content Not Available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-4">
                      This lesson doesn't have content yet. We can generate it for you using AI.
                    </p>
                    <button
                      onClick={() => triggerAutoGeneration(lesson)}
                      disabled={isGenerating}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Content</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 mt-8">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">{children}</h3>,
                      h4: ({children}) => <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 mt-4">{children}</h4>,
                      p: ({children}) => <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ol>,
                      li: ({children}) => <li className="text-slate-700 dark:text-slate-300">{children}</li>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-slate-600 dark:text-slate-400 mb-4">{children}</blockquote>,
                      code: ({children}) => <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-slate-900 dark:text-slate-100">{children}</code>,
                      pre: ({children}) => <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      strong: ({children}) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                      em: ({children}) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
                      a: ({href, children}) => <a href={href} className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                    }}
                  >
                    {lesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>

            {/* Debug Info - Temporary */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Debug Info:</h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <div>hasTest: {hasTest.toString()}</div>
                  <div>isEmpty: {isEmpty.toString()}</div>
                  <div>lesson.test: {lesson.test ? 'exists' : 'null'}</div>
                  <div>test questions: {lesson.test?.questions?.length || 0}</div>
                  <div>testScore: {testScore || 'none'}</div>
                </div>
              </div>
            )}

            {/* Inline Test Section */}
            {hasTest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mt-6"
              >
                {/* Test Header */}
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-slate-200 dark:border-slate-700"
                  onClick={() => setIsTestExpanded(!isTestExpanded)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Lesson Test
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {lesson.test?.questions?.length || 0} questions
                        {testScore && (
                          <span className={`ml-2 ${testScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            • Score: {testScore}%
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {testScore && (
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        testScore >= 70 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {testScore >= 70 ? 'Passed' : 'Failed'}
                      </span>
                    )}
                    {isTestExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Test Content */}
                <AnimatePresence>
                  {isTestExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        {testResult ? (
                          // Test Results
                          <div className="space-y-6">
                            <div className={`p-6 rounded-lg ${
                              testResult.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                            }`}>
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  testResult.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                }`}>
                                  {testResult.passed ? (
                                    <Award className="h-6 w-6 text-green-600" />
                                  ) : (
                                    <RotateCcw className="h-6 w-6 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className={`text-lg font-semibold ${
                                    testResult.passed ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                                  }`}>
                                    {testResult.passed ? 'Test Passed!' : 'Test Failed'}
                                  </h4>
                                  <p className={`text-sm ${
                                    testResult.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                  }`}>
                                    {testResult.passed 
                                      ? 'Congratulations! You have successfully completed this lesson.' 
                                      : 'Don\'t worry, you can retake the test to improve your score.'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Score Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {testResult.score}%
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  Final Score
                                </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                  {testResult.correctAnswers}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  Correct
                                </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-1">
                                  {testResult.totalQuestions}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  Total
                                </div>
                              </div>
                            </div>

                            {/* Retake Button */}
                            <div className="flex justify-center">
                              <button
                                onClick={resetTest}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span>Retake Test</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Test Questions
                          <div className="space-y-6">
                            {testError && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-700 dark:text-red-400 text-sm">{testError}</span>
                                </div>
                              </div>
                            )}

                            {!lesson.test?.questions || lesson.test.questions.length === 0 ? (
                              <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  No Questions Available
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-500">
                                  This test doesn't have any questions yet. Try regenerating the lesson content to create test questions.
                                </p>
                              </div>
                            ) : (
                              <>
                                {lesson.test!.questions!.map((question, index) => (
                                  <div key={index} className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-slate-900 dark:text-white font-medium mb-3">
                                          {question.question}
                                        </p>

                                        {question.answerType === 'multiple choice' ? (
                                          <div className="space-y-2">
                                            {question.options?.map((option, optionIndex) => (
                                              <label
                                                key={optionIndex}
                                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                                  testAnswers.find(a => a.questionIndex === index)?.answer === optionIndex
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`question-${index}`}
                                                  value={optionIndex}
                                                  checked={testAnswers.find(a => a.questionIndex === index)?.answer === optionIndex}
                                                  onChange={() => handleTestAnswerChange(index, optionIndex)}
                                                  className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                                  testAnswers.find(a => a.questionIndex === index)?.answer === optionIndex
                                                    ? 'border-primary bg-primary'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                  {testAnswers.find(a => a.questionIndex === index)?.answer === optionIndex && (
                                                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                                                  )}
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-300">{option}</span>
                                              </label>
                                            ))}
                                          </div>
                                        ) : (
                                          <div>
                                            <input
                                              type="number"
                                              value={testAnswers.find(a => a.questionIndex === index)?.answer || ''}
                                              onChange={(e) => handleTestAnswerChange(index, parseFloat(e.target.value) || 0)}
                                              placeholder="Enter your numeric answer"
                                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {index < lesson.test!.questions!.length - 1 && (
                                      <hr className="border-slate-200 dark:border-slate-700" />
                                    )}
                                  </div>
                                ))}

                                {/* Submit Button */}
                                <div className="flex justify-center pt-4">
                                  <button
                                    onClick={submitTest}
                                    disabled={isSubmittingTest || testAnswers.some(a => a.answer === '')}
                                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSubmittingTest ? (
                                      <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    <span>{isSubmittingTest ? 'Submitting...' : 'Submit Test'}</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Lesson Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Lesson Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                {lesson.user_progress?.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Completed:</span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {new Date(lesson.user_progress.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {hasTest && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Test Status:</span>
                      <span className={`text-sm font-medium ${
                        testScore 
                          ? testScore >= 70 ? 'text-green-600' : 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {testScore 
                          ? `${testScore}% (${testScore >= 70 ? 'Passed' : 'Failed'})` 
                          : 'Available'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testScore 
                        ? 'Test completed. You can retake it below.'
                        : 'Take the test below after reading the lesson.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lesson Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Lesson Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Created:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(lesson.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Order:</span>
                  <span className="text-slate-900 dark:text-white">
                    Lesson #{lesson.lesson_order + 1}
                  </span>
                </div>

                {hasTest && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Questions:</span>
                    <span className="text-slate-900 dark:text-white">
                      {lesson.test?.questions?.length || 0}
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