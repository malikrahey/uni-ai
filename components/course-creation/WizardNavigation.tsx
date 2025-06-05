"use client";

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { WizardStep } from '@/types/course-creation';

interface WizardNavigationProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  isStepAccessible: (step: WizardStep) => boolean;
}

export default function WizardNavigation({
  steps,
  currentStep,
  onStepClick,
  isStepAccessible
}: WizardNavigationProps) {
  return (
    <nav className="py-4">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepNumber = step.id as WizardStep;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isAccessible = isStepAccessible(stepNumber);
          const canClick = isAccessible || isCompleted || isActive;

          return (
            <li key={step.id} className="flex-1">
              <div className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => canClick && onStepClick(stepNumber)}
                    disabled={!canClick}
                    className={`
                      relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${isCompleted
                        ? 'bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark'
                        : isActive
                        ? 'bg-primary border-primary text-white'
                        : canClick
                        ? 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 rounded-full border-4 border-primary/30"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive || isCompleted
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    stepNumber < currentStep
                      ? 'bg-primary'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </nav>
  );
} 