"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { CourseCreationForm, WizardStep } from '@/types/course-creation';
import WizardNavigation from './WizardNavigation';
import PlanTypeStep from './PlanTypeStep';
import SubjectSelectionStep from './SubjectSelectionStep';
import KnowledgeAssessmentStep from './KnowledgeAssessmentStep';
import ReviewStep from './ReviewStep';

const WIZARD_STEPS = [
  { id: 1, title: 'Plan Type', description: 'Choose your learning format' },
  { id: 2, title: 'Subject', description: 'What do you want to learn?' },
  { id: 3, title: 'Knowledge Level', description: 'Assess your experience' },
  { id: 4, title: 'Review', description: 'Confirm and create' }
];

export default function CourseCreationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get step from URL or default to 1
  const currentStepParam = searchParams.get('step');
  const initialStep = currentStepParam ? Math.max(1, Math.min(4, parseInt(currentStepParam))) : 1;
  
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep as WizardStep);
  const [formData, setFormData] = useState<CourseCreationForm>({});

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('courseCreationDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('courseCreationDraft', JSON.stringify(formData));
    }
  }, [formData]);

  // Update URL when step changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', currentStep.toString());
    window.history.replaceState({}, '', url.toString());
  }, [currentStep]);

  // Form data update handler
  const handleFormUpdate = (data: Partial<CourseCreationForm>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as WizardStep);
    }
  };

  const handleStepClick = (step: WizardStep) => {
    // Only allow going to completed steps or the next step
    if (step <= currentStep || isStepAccessible(step)) {
      setCurrentStep(step);
    }
  };

  // Check if a step is accessible based on completed data
  const isStepAccessible = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!formData.planType;
      case 3:
        return !!formData.planType && !!formData.subject;
      case 4:
        return !!formData.planType && !!formData.subject && !!formData.startingLevel && !!formData.desiredLevel;
      default:
        return false;
    }
  };

  // Check if current step can proceed
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.planType;
      case 2:
        return !!formData.subject;
      case 3:
        return !!formData.startingLevel && !!formData.desiredLevel;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Handle wizard exit
  const handleExit = () => {
    const hasData = Object.keys(formData).length > 0;
    if (hasData) {
      const confirmed = window.confirm(
        'You have unsaved progress. Are you sure you want to exit? Your progress will be saved as a draft.'
      );
      if (!confirmed) return;
    }
    router.push('/');
  };

  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem('courseCreationDraft');
    setFormData({});
  };

  // Render current step component
  const renderStep = () => {
    const stepProps = {
      formData,
      onUpdate: handleFormUpdate,
      onNext: handleNext,
      onBack: handleBack,
      canGoNext: canGoNext(),
      canGoBack: currentStep > 1
    };

    switch (currentStep) {
      case 1:
        return <PlanTypeStep {...stepProps} />;
      case 2:
        return <SubjectSelectionStep {...stepProps} />;
      case 3:
        return <KnowledgeAssessmentStep {...stepProps} />;
      case 4:
        return <ReviewStep {...stepProps} onClearDraft={clearDraft} />;
      default:
        return <PlanTypeStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleExit}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create New Learning Plan
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {WIZARD_STEPS[currentStep - 1].description}
                </p>
              </div>
            </div>
            <button
              onClick={handleExit}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Navigation */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <WizardNavigation
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            isStepAccessible={isStepAccessible}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {/* isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-slate-900 dark:text-white">Creating your course...</span>
          </div>
        </div>
      ) */}
    </div>
  );
} 