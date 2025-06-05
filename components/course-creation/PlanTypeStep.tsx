"use client";

import { motion } from 'framer-motion';
import { 
  Zap, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Target, 
  Users,
  ChevronRight,
  Check
} from 'lucide-react';
import { WizardStepProps, PlanType, PlanTypeOption } from '@/types/course-creation';

const PLAN_OPTIONS: PlanTypeOption[] = [
  {
    id: 'crash-course',
    title: 'Crash Course',
    description: 'Intensive learning for quick skill acquisition',
    duration: '1-4 weeks',
    intensity: 'High',
    timeCommitment: '2-4 hours/day',
    icon: 'zap',
    recommended: 'Perfect for urgent skill needs or specific topics',
    features: [
      'Focused on one specific skill or concept',
      'High-intensity learning schedule',
      'Quick practical application',
      'Immediate results and feedback',
      'Condensed essential content only'
    ]
  },
  {
    id: 'course',
    title: 'Comprehensive Course',
    description: 'Balanced learning for solid skill development',
    duration: '1-3 months',
    intensity: 'Medium',
    timeCommitment: '5-10 hours/week',
    icon: 'book',
    recommended: 'Ideal for building comprehensive understanding',
    features: [
      'Complete subject coverage',
      'Theory and practical balance',
      'Progressive skill building',
      'Projects and assignments',
      'Community interaction'
    ]
  },
  {
    id: 'full-degree',
    title: 'Full Degree Program',
    description: 'Complete academic journey with specialization',
    duration: '2-4 years',
    intensity: 'Low-Medium',
    timeCommitment: '15-20 hours/week',
    icon: 'graduation',
    recommended: 'Best for career change or formal qualification',
    features: [
      'University-level curriculum',
      'Multiple specialization tracks',
      'Research and capstone projects',
      'Industry partnerships',
      'Academic credentials'
    ]
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'zap':
      return Zap;
    case 'book':
      return BookOpen;
    case 'graduation':
      return GraduationCap;
    default:
      return BookOpen;
  }
};

export default function PlanTypeStep({
  formData,
  onUpdate,
  onNext,
  canGoNext
}: WizardStepProps) {
  const handlePlanSelect = (planType: PlanType) => {
    onUpdate({ planType });
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      onNext();
    }, 500);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Choose Your Learning Format
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Select the type of learning plan that best fits your goals, schedule, and commitment level.
        </p>
      </div>

      {/* Plan Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLAN_OPTIONS.map((option, index) => {
          const IconComponent = getIcon(option.icon);
          const isSelected = formData.planType === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative cursor-pointer rounded-xl border-2 transition-all duration-300
                ${isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md'
                }
              `}
              onClick={() => handlePlanSelect(option.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}

              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {option.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{option.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{option.intensity}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{option.timeCommitment}</span>
                  </div>
                </div>

                {/* Recommended For */}
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                    "{option.recommended}"
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  {option.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                  {option.features.length > 3 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      +{option.features.length - 3} more features
                    </div>
                  )}
                </div>

                {/* Selection Arrow */}
                <div className="flex justify-end mt-4">
                  <ChevronRight className={`h-5 w-5 transition-colors ${
                    isSelected ? 'text-primary' : 'text-slate-400'
                  }`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {formData.planType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            <span className="font-medium">
              {PLAN_OPTIONS.find(opt => opt.id === formData.planType)?.title} selected
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Proceeding to subject selection...
          </p>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Not sure which format is right for you?{' '}
          <button className="text-primary hover:text-primary-dark underline">
            Take our quick assessment
          </button>
        </p>
      </div>
    </div>
  );
} 