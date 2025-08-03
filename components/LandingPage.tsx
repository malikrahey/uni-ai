"use client";

import { TypewriterEffect } from '@/components/TypewriterEffect';
import { FaBookOpen, FaClipboardList, FaBrain, FaRocket, FaUsers, FaCheck } from 'react-icons/fa6';
import { 
  GraduationCap, BookOpen, ClipboardCheck, Target, Sparkles, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link as ScrollLink } from 'react-scroll';
import { VideoModal } from '@/components/VideoModal';
import Image from 'next/image';

// Updated workflow steps for AI course generation
const workflowSteps = [
  {
    title: "Choose Your Learning Path",
    description: "Select from various subjects and topics you want to learn",
    preview: <TypewriterEffect text="Computer Science • Business • Engineering • Medicine..." />
  },
  {
    title: "AI Generates Your Course",
    description: "Our AI creates a personalized learning curriculum just for you",
    preview: <TypewriterEffect text="Creating personalized lesson plan..." />
  },
  {
    title: "Learn with Interactive Content",
    description: "Engage with AI-generated lessons, examples, and explanations",
    preview: <TypewriterEffect text="Building interactive learning modules..." />
  },
  {
    title: "Practice & Master Skills",
    description: "Test your knowledge with custom quizzes and exercises",
    preview: <TypewriterEffect text="Generating practice questions..." />
  }
];

// Available subjects for learning
const subjects = [
  { name: 'Computer Science', icon: FaBrain },
  { name: 'Business & Finance', icon: FaBookOpen },
  { name: 'Engineering', icon: FaRocket },
  { name: 'Mathematics', icon: FaClipboardList },
  { name: 'Language Learning', icon: FaUsers },
  { name: 'Science & Technology', icon: FaBrain }
];

// Platform sections
const platformSections = [
  {
    id: "overview",
    title: "Overview",
    description: "AI-powered learning platform that generates personalized courses",
    bgColor: "bg-white dark:bg-[#0B1120]"
  },
  {
    id: "how-it-works",
    title: "How It Works",
    description: "Simple steps to start your personalized learning journey",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]"
  },
  {
    id: "features",
    title: "Features",
    description: "Everything you need to accelerate your learning",
    bgColor: "bg-white dark:bg-[#0B1120]"
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Simple, transparent pricing for everyone",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]"
  }
];

// Feature cards for the platform
const featureCards = [
  {
    title: "AI-Generated Courses",
    description: "Personalized learning paths created by advanced AI",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    bgGradient: "from-blue-500/10 to-sky-500/10"
  },
  {
    title: "Interactive Lessons",
    description: "Engaging content with examples and explanations",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    bgGradient: "from-green-500/10 to-emerald-500/10"
  },
  {
    title: "Custom Practice Tests",
    description: "Reinforce learning with personalized quizzes",
    icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
    bgGradient: "from-orange-500/10 to-red-500/10"
  },
  {
    title: "Progress Tracking",
    description: "Monitor your learning journey and achievements",
    icon: <Target className="h-6 w-6 text-primary" />,
    bgGradient: "from-sky-500/10 to-blue-500/10"
  },
  {
    title: "Flexible Learning",
    description: "Learn at your own pace, anytime, anywhere",
    icon: <Zap className="h-6 w-6 text-primary" />,
    bgGradient: "from-cyan-500/10 to-blue-500/10"
  },
  {
    title: "Multiple Subjects",
    description: "Access courses across various fields and topics",
    icon: <GraduationCap className="h-6 w-6 text-primary" />,
    bgGradient: "from-blue-500/10 to-sky-500/10"
  }
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const router = useRouter();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] relative">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-darker/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 overflow-x-auto hide-scrollbar">
            {platformSections.map((section, index) => (
              <ScrollLink
                key={section.id}
                to={section.id}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                onSetActive={() => setActiveSection(section.id)}
                className={`flex items-center cursor-pointer group min-w-fit mx-4 first:ml-0 last:mr-0`}
              >
                <div className="relative">
                  <span 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 transition-all duration-300
                      ${activeSection === section.id 
                      ? 'bg-primary dark:bg-primary-light text-white' 
                      : 'bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light group-hover:bg-primary/20 dark:group-hover:bg-primary-light/20'}`}
                  >
                    {index + 1}
                  </span>
                </div>
                <span 
                  className={`text-sm font-medium transition-colors duration-300 hidden md:block whitespace-nowrap
                    ${activeSection === section.id 
                    ? 'text-slate-800 dark:text-slate-100' 
                    : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100'}`}
                >
                  {section.title}
                </span>
              </ScrollLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="overview" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-accent-light/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-20 pb-16 sm:pb-24">
            {/* Header Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Image src="/acceluni.png" alt="Acceluni Logo" width={100} height={100} />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
                  Acceluni
                </h1>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
                AI-Powered Learning Platform
              </h2>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                Generate personalized courses with AI guidance. Learn at your own pace with interactive lessons, 
                custom practice tests, and comprehensive progress tracking.
              </p>
              
              {/* Key Benefits */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaCheck className="mr-2 text-primary" />
                  Personalized learning paths
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaCheck className="mr-2 text-primary" />
                  Interactive AI lessons
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaCheck className="mr-2 text-primary" />
                  Custom practice tests
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex gap-4 justify-center">

                <button 
                  onClick={() => router.push('/login')} 
                  className="px-8 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Learning
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-1 gap-8">


              {/* Workflow Steps */}
              <div className="grid grid-cols-1 gap-4">
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 1, y: 0 }}
                    className="relative p-4 bg-white/5 dark:bg-neutral-dark border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
                  >
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary dark:bg-primary-light text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="ml-8">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{step.description}</p>
                      <div className="text-xs text-primary dark:text-primary-light">
                        {step.preview}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Available Subjects */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
                Available Learning Subjects
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-4 bg-white/5 dark:bg-neutral-dark border border-slate-200 dark:border-slate-700/50 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <subject.icon className="h-5 w-5 text-primary mr-3" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{subject.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-slate-50 dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our AI platform makes learning simple and effective. Here&apos;s how you can get started:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to accelerate your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${feature.bgGradient} border border-white/20 backdrop-blur-sm hover:border-primary/30 transition-all group`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-slate-50 dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              One plan, unlimited learning. No hidden fees, no complicated tiers.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl p-8 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Premium Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$9.99</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">/month</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-8">
                  Access to all features and unlimited learning
                </p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    AI-generated personalized courses
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    Interactive lessons and examples
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    Custom practice tests and quizzes
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    Progress tracking and analytics
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    Multiple subjects and topics
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <FaCheck className="h-5 w-5 text-primary mr-3" />
                    Learn at your own pace
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/login')}
                  className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all"
                >
                  Start Learning Today
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="relative py-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-accent-light/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white dark:bg-neutral-dark rounded-xl shadow-xl p-12 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <motion.h2 
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
              >
                Ready to Start Your Learning Journey?
              </motion.h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Join learners who are already accelerating their education with AI-powered courses
              </p>
              
              <div className="flex gap-4 justify-center">

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Learning
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="S1cnQG0-LP4"
      />
    </div>
  );
} 