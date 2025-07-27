"use client";

import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

export default function TestWizardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Course Creation Wizard Test
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Testing the complete 4-step course creation flow including subject selection
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            Complete Wizard Flow
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Step 1: Plan Type Selection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Step 2: Subject Selection ✅</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Step 3: Knowledge Assessment</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Step 4: Review & Create</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Subject Selection Features
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• 8 major categories (Technology, Business, etc.)</li>
                <li>• 80+ predefined topics with search</li>
                <li>• Plan-specific recommendations</li>
                <li>• Custom topic input</li>
                <li>• Category filtering</li>
                <li>• Trending topics display</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/course-creation"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5" />
              Start Wizard
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              href="/course-creation?step=2"
              className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold"
            >
              Jump to Subject Selection
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            ✅ Subject Selection Integration Complete
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            The subject selection step is fully integrated into the course creation wizard. 
            Users can choose from 8 categories, search through 80+ topics, get plan-specific recommendations, 
            and even add custom subjects. The flow properly validates subject selection before allowing 
            progression to the knowledge assessment step.
          </p>
        </div>
      </div>
    </div>
  );
} 