"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Sparkles, 
  Clock, 
  Target, 
  BookOpen,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { WizardStepProps, PlanType } from '@/types/course-creation';
import { useCourses } from '@/hooks/useCourses';
import { useDegrees } from '@/hooks/useDegrees';

interface ReviewStepProps extends WizardStepProps {
  onClearDraft: () => void;
}

// Helper function to format plan type for display
const formatPlanType = (planType: PlanType) => {
  return planType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to get estimated duration based on plan type and knowledge level
const getEstimatedDuration = (planType: PlanType, startingLevel: string) => {
  const baseDurations = {
    'crash-course': { weeks: 2, months: 0 },
    'course': { weeks: 0, months: 2 },
    'full-degree': { weeks: 0, months: 36 }
  };

  const adjustments = {
    'beginner': 1.5,
    'some-experience': 1.0,
    'intermediate': 0.8,
    'advanced': 0.6
  };

  const base = baseDurations[planType];
  const multiplier = adjustments[startingLevel as keyof typeof adjustments] || 1.0;
  
  if (base.months > 0) {
    const adjustedMonths = Math.round(base.months * multiplier);
    return adjustedMonths > 12 ? `${Math.round(adjustedMonths / 12)} years` : `${adjustedMonths} months`;
  } else {
    const adjustedWeeks = Math.round(base.weeks * multiplier);
    return `${adjustedWeeks} weeks`;
  }
};

export default function ReviewStep({
  formData,
  onBack,
  canGoBack,
  onClearDraft
}: ReviewStepProps) {
  const router = useRouter();
  const { createCourse } = useCourses();
  const { createDegree } = useDegrees();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdItem, setCreatedItem] = useState<{ id: string; name?: string; title?: string; description?: string; icon?: string } | null>(null);
  const [createdItemType, setCreatedItemType] = useState<'course' | 'degree' | null>(null);

  const estimatedDuration = formData.planType && formData.startingLevel 
    ? getEstimatedDuration(formData.planType, formData.startingLevel)
    : 'TBD';

  const handleCreateCourse = async () => {
    if (!formData.planType || !formData.subject) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      // Determine if we should create a degree or course based on plan type
      const isFullDegree = formData.planType === 'full-degree';

      if (isFullDegree) {
        // Create a degree
        const degreeData = {
          name: `${formData.subject} - Full Degree`,
          description: `A Full Degree in ${formData.subject}. Starting from ${formData.startingLevel} level, targeting ${formData.desiredLevel} expertise.`,
          icon: '🎓' // Default degree icon
        };

        const newDegree = await createDegree(degreeData);

        if (newDegree) {
          setCreatedItem(newDegree);
          setCreatedItemType('degree');
          onClearDraft();
          
          // Redirect to the new degree after a short delay
          setTimeout(() => {
            router.push(`/degrees/${newDegree.id}`);
          }, 2000);
        } else {
          setCreateError('Failed to create degree. Please try again.');
        }
      } else {
        // Create a standalone course (existing logic with new schema)
        const courseData = {
          title: `${formData.subject} - ${formatPlanType(formData.planType)}`,
          university: 'Acceluni Academy',
          degree_type: formData.subject,
          duration_years: formData.planType === 'crash-course' ? 1 : (formData.planType === 'course' ? 1 : 4),
          description: `A ${formatPlanType(formData.planType)} in ${formData.subject}. Starting from ${formData.startingLevel} level, targeting ${formData.desiredLevel} expertise.`,
          start_date: new Date().toISOString()
        };

        const newCourse = await createCourse(courseData);

        if (newCourse) {
          setCreatedItem(newCourse);
          setCreatedItemType('course');
          onClearDraft();
          
          // Redirect to the new course after a short delay
          setTimeout(() => {
            router.push(`/courses/${newCourse.id}`);
          }, 2000);
        } else {
          setCreateError('Failed to create course. Please try again.');
        }
      }
    } catch (error) {
      console.error('Creation error:', error);
      setCreateError('An unexpected error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getSummaryItems = () => [
    {
      label: 'Learning Format',
      value: formData.planType ? formatPlanType(formData.planType) : 'Not selected',
      icon: <BookOpen className="h-4 w-4" />,
      editStep: 1
    },
    {
      label: 'Subject',
      value: formData.subject || 'Not selected',
      icon: <Target className="h-4 w-4" />,
      editStep: 2
    },
    {
      label: 'Starting Level',
      value: formData.startingLevel?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not selected',
      icon: <span className="text-sm">🌱</span>,
      editStep: 3
    },
    {
      label: 'Target Level',
      value: formData.desiredLevel?.replace(/\b\w/g, l => l.toUpperCase()) || 'Not selected',
      icon: <span className="text-sm">🎯</span>,
      editStep: 3
    },
    {
      label: 'Estimated Duration',
      value: estimatedDuration,
      icon: <Clock className="h-4 w-4" />,
      editStep: null
    }
  ];

  // Show success state
  if (createdItem) {
    const isDegreee = createdItemType === 'degree';
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            🎉 {isDegreee ? 'Degree' : 'Course'} Created Successfully!
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            Your personalized {isDegreee ? 'degree program' : 'learning plan'} for <strong>{formData.subject}</strong> has been created.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              What&apos;s Next?
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {isDegreee ? (
                <>
                  <li>• AI-generated courses will be created for this degree</li>
                  <li>• Comprehensive curriculum spanning multiple topics</li>
                  <li>• Structured progression through course sequences</li>
                  <li>• Complete degree completion tracking</li>
                </>
              ) : (
                <>
                  <li>• AI-generated curriculum will be available shortly</li>
                  <li>• Personalized lessons based on your knowledge level</li>
                  <li>• Progress tracking and milestone checkpoints</li>
                  <li>• Adaptive learning recommendations</li>
                </>
              )}
            </ul>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirecting to your {isDegreee ? 'degree' : 'course'} in a moment...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Review & Create Your Learning Plan
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Review your selections and create your personalized learning journey.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {getSummaryItems().map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {item.label}
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
                {item.editStep && (
                  <button
                    onClick={() => {
                      // Navigate back to specific step for editing
                      const url = new URL(window.location.href);
                      url.searchParams.set('step', item.editStep.toString());
                      window.history.pushState({}, '', url.toString());
                      window.location.reload();
                    }}
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Learning Plan Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Your Personalized Learning Journey
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-slate-900 dark:text-white">Curriculum</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                AI-generated lessons tailored to your level
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-slate-900 dark:text-white">Progress Tracking</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real-time progress monitoring and insights
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-slate-900 dark:text-white">Adaptive Learning</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Adjusts to your pace and learning style
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error creating course</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {createError}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {canGoBack && !isCreating && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleCreateCourse}
            disabled={isCreating || !formData.planType || !formData.subject || !formData.startingLevel || !formData.desiredLevel}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-3 min-w-[200px] justify-center"
          >
            {isCreating ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Create Learning Plan
              </>
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your course will be created with AI-generated content tailored to your selections.
            You can always modify your learning path later.
          </p>
        </div>
      </div>
    </div>
  );
} 