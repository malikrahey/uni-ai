"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  AlertCircle,
  Loader,
  Target,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Test, TestAnswer, TestResult, Question } from '@/types/education';

export default function TestTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const testId = params.id as string;

  useEffect(() => {
    if (!session?.access_token || !testId) return;

    const fetchTest = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get test through lesson detail API
        const response = await fetch(`/api/lessons/${testId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch test');
        }

        const result = await response.json();
        const lessonTest = result.lesson?.test;
        
        if (!lessonTest) {
          throw new Error('Test not found for this lesson');
        }

        setTest(lessonTest);
        
        // Initialize answers array
        setAnswers(lessonTest.questions.map((_: Question, index: number) => ({
          questionIndex: index,
          answer: ''
        })));
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [session?.access_token, testId]);

  const handleAnswerChange = (questionIndex: number, answer: number | string) => {
    setAnswers(prev => prev.map(a => 
      a.questionIndex === questionIndex 
        ? { ...a, answer } 
        : a
    ));
  };

  const submitTest = async () => {
    if (!test || !session?.access_token) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tests/${test.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit test');
      }

      const result = await response.json();
      setTestResult(result.result);
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="text-slate-600 dark:text-slate-300">Loading test...</span>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-red-200 dark:border-red-800 max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Test
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
            {error || 'Test not found'}
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

  // Show test results
  if (testResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              testResult.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {testResult.passed ? (
                <Award className="h-10 w-10 text-green-600" />
              ) : (
                <RotateCcw className="h-10 w-10 text-red-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {testResult.passed ? 'Congratulations!' : 'Test Complete'}
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              {testResult.passed 
                ? 'You have successfully passed the test!' 
                : 'You can retake the test to improve your score.'
              }
            </p>

            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {testResult.score}%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Final Score
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {testResult.correctAnswers}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Correct Answers
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                  {testResult.totalQuestions}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Questions
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Back to Lesson
              </button>
              
              {!testResult.passed && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Retake Test
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionIndex === currentQuestion)?.answer || '';
  const answeredQuestions = answers.filter(a => a.answer !== '').length;
  const allAnswered = answeredQuestions === test.questions.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Lesson Test
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Question {currentQuestion + 1} of {test.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Progress: {answeredQuestions}/{test.questions.length}
              </div>
              <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredQuestions / test.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Question {currentQuestion + 1}
                  </h2>
                  <p className="text-lg text-slate-700 dark:text-slate-300">
                    {currentQ.question}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-4">
                  {currentQ.answerType === 'multiple choice' ? (
                    currentQ.options?.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          currentAnswer === index
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={index}
                          checked={currentAnswer === index}
                          onChange={() => handleAnswerChange(currentQuestion, index)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          currentAnswer === index
                            ? 'border-primary bg-primary'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {currentAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{option}</span>
                      </label>
                    ))
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Enter your numeric answer:
                      </label>
                      <input
                        type="number"
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(currentQuestion, parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Enter a number..."
                      />
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  {currentQuestion === test.questions.length - 1 ? (
                    <button
                      onClick={submitTest}
                      disabled={!allAnswered || isSubmitting}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4" />
                          <span>Submit Test</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Questions
              </h3>
              
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {test.questions.map((_, index) => {
                  const isAnswered = answers.find(a => a.questionIndex === index)?.answer !== '';
                  const isCurrent = index === currentQuestion;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-primary text-white'
                          : isAnswered
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                  <span className="text-slate-600 dark:text-slate-400">Answered</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded mr-2" />
                  <span className="text-slate-600 dark:text-slate-400">Not answered</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-primary rounded mr-2" />
                  <span className="text-slate-600 dark:text-slate-400">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 