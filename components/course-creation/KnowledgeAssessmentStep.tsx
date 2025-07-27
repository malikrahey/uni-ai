"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Target, 
  ChevronRight, 
  CheckCircle, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { WizardStepProps, StartingLevel, DesiredLevel } from '@/types/course-creation';

const STARTING_LEVELS = [
  {
    id: 'beginner' as StartingLevel,
    title: 'Complete Beginner',
    description: "I'm new to this topic",
    detail: 'Little to no experience with this subject',
    icon: '🌱',
    timeEstimate: '+2-4 weeks foundation',
    examples: ['Never studied this before', 'Heard about it but never tried', 'Starting from scratch']
  },
  {
    id: 'some-experience' as StartingLevel,
    title: 'Some Experience',
    description: 'I have basic knowledge or exposure',
    detail: 'Familiar with basic concepts but need structure',
    icon: '🌿',
    timeEstimate: 'Standard timeline',
    examples: ['Tried it briefly before', 'Know some basics', 'Self-taught fundamentals']
  },
  {
    id: 'intermediate' as StartingLevel,
    title: 'Intermediate',
    description: 'I understand fundamentals but need depth',
    detail: 'Solid foundation, ready for advanced topics',
    icon: '🌳',
    timeEstimate: '-1-2 weeks',
    examples: ['Can do basic tasks', 'Understand core concepts', 'Have practical experience']
  },
  {
    id: 'advanced' as StartingLevel,
    title: 'Advanced',
    description: "I'm experienced but want to master specific areas",
    detail: 'Strong background, seeking specialization',
    icon: '🏔️',
    timeEstimate: '-2-4 weeks',
    examples: ['Professional experience', 'Advanced understanding', 'Seeking specialization']
  }
];

const DESIRED_LEVELS = [
  {
    id: 'functional' as DesiredLevel,
    title: 'Functional',
    description: 'I want to use this practically',
    detail: 'Able to complete tasks and solve problems',
    icon: '⚡',
    outcome: 'Complete basic to intermediate projects',
    skills: ['Core concepts', 'Practical application', 'Problem solving', 'Basic troubleshooting']
  },
  {
    id: 'proficient' as DesiredLevel,
    title: 'Proficient',
    description: 'I want solid expertise',
    detail: 'Confident and competent in most areas',
    icon: '🎯',
    outcome: 'Handle complex projects independently',
    skills: ['Advanced techniques', 'Best practices', 'Independent work', 'Teaching others']
  },
  {
    id: 'expert' as DesiredLevel,
    title: 'Expert',
    description: 'I want to master this completely',
    detail: 'Deep understanding and innovation capability',
    icon: '🏆',
    outcome: 'Lead projects and innovate solutions',
    skills: ['Cutting-edge knowledge', 'Innovation', 'Leadership', 'Research & development']
  },
  {
    id: 'professional' as DesiredLevel,
    title: 'Professional',
    description: 'I want career-level competency',
    detail: 'Industry-ready skills for professional work',
    icon: '💼',
    outcome: 'Ready for professional roles',
    skills: ['Industry standards', 'Professional tools', 'Certification prep', 'Career readiness']
  }
];

export default function KnowledgeAssessmentStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  canGoBack
}: WizardStepProps) {
  const [selectedStarting, setSelectedStarting] = useState<StartingLevel | null>(
    formData.startingLevel || null
  );
  const [selectedDesired, setSelectedDesired] = useState<DesiredLevel | null>(
    formData.desiredLevel || null
  );

  const handleStartingLevelSelect = (level: StartingLevel) => {
    setSelectedStarting(level);
    onUpdate({ startingLevel: level });
  };

  const handleDesiredLevelSelect = (level: DesiredLevel) => {
    setSelectedDesired(level);
    onUpdate({ desiredLevel: level });
  };

  const handleContinue = () => {
    if (selectedStarting && selectedDesired) {
      onNext();
    }
  };

  const getTimeAdjustment = () => {
    if (!selectedStarting) return '';
    const level = STARTING_LEVELS.find(l => l.id === selectedStarting);
    return level?.timeEstimate || '';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Assess Your Knowledge Level
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Help us customize your learning path by telling us your current knowledge and desired expertise level.
        </p>
      </div>

      {/* Course Context */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-white">Subject:</span> {formData.subject}
          </div>
          <div className="text-slate-300 dark:text-slate-600">•</div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-white">Format:</span> {' '}
            {formData.planType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>
      </div>

      {/* Starting Level Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
              What&apos;s your starting level?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Be honest - this helps us create the perfect learning path for you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTING_LEVELS.map((level, index) => {
            const isSelected = selectedStarting === level.id;
            
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartingLevelSelect(level.id)}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{level.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-lg font-semibold ${
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {level.title}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                      {level.description}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {level.detail}
                    </p>
                    
                    {/* Time Estimate */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {level.timeEstimate}
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="space-y-1">
                      {level.examples.slice(0, 2).map((example, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <div className="w-1 h-1 bg-slate-400 rounded-full" />
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Desired Level Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
              What&apos;s your desired level?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Choose the expertise level you want to achieve
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DESIRED_LEVELS.map((level, index) => {
            const isSelected = selectedDesired === level.id;
            
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index * 0.1) + 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDesiredLevelSelect(level.id)}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{level.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-lg font-semibold ${
                        isSelected ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {level.title}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                      {level.description}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {level.detail}
                    </p>
                    
                    {/* Outcome */}
                    <div className={`text-sm font-medium mb-3 ${
                      isSelected ? 'text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      Outcome: {level.outcome}
                    </div>

                    {/* Skills */}
                    <div className="space-y-1">
                      {level.skills.slice(0, 3).map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Learning Path Preview */}
      {selectedStarting && selectedDesired && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Personalized Learning Path
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">
                {STARTING_LEVELS.find(l => l.id === selectedStarting)?.icon}
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Starting Point</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {STARTING_LEVELS.find(l => l.id === selectedStarting)?.title}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-slate-400" />
            </div>
            
            <div>
              <div className="text-2xl mb-2">
                {DESIRED_LEVELS.find(l => l.id === selectedDesired)?.icon}
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Target Goal</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {DESIRED_LEVELS.find(l => l.id === selectedDesired)?.title}
              </div>
            </div>
          </div>
          
          {getTimeAdjustment() && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm">
                <span className="text-slate-600 dark:text-slate-400">Timeline adjustment:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {getTimeAdjustment()}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 justify-center">
        {canGoBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedStarting || !selectedDesired}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          Continue to Review
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 