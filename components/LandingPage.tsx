"use client";

import { PricingSection } from '@/components/PricingSection';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { TypewriterEffect } from '@/components/TypewriterEffect';
import { FaGraduationCap, FaBookOpen, FaClipboardList, FaChartLine, FaBrain, FaRocket, FaUsers, FaAward, FaClock } from 'react-icons/fa6';
import { 
  GraduationCap, BookOpen, ClipboardCheck, Brain, Target, Users
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link as ScrollLink } from 'react-scroll';
import { VideoModal } from '@/components/VideoModal';

/* eslint-disable @typescript-eslint/no-unused-vars */

// Updated workflow steps for course planning
const workflowSteps = [
  {
    title: "Select Your Degree",
    description: "Choose your university program and specialization",
    preview: <TypewriterEffect text="Computer Science • Business • Engineering • Medicine..." />
  },
  {
    title: "Generate Course Plan",
    description: "AI creates a complete semester-by-semester roadmap",
    preview: <TypewriterEffect text="Generating 4-year curriculum with prerequisites..." />
  },
  {
    title: "Create Lessons",
    description: "Generate detailed lessons for each course topic",
    preview: <TypewriterEffect text="Building interactive lessons with examples..." />
  },
  {
    title: "Practice & Test",
    description: "Take custom tests to master the material",
    preview: <TypewriterEffect text="Creating personalized practice tests..." />
  }
];

// Updated for university subjects/fields
const subjects = [
  { name: 'Computer Science', icon: FaBrain },
  { name: 'Engineering', icon: FaRocket },
  { name: 'Business', icon: FaChartLine },
  { name: 'Medicine', icon: FaUsers },
  { name: 'Mathematics', icon: FaClipboardList },
  { name: 'Psychology', icon: FaBrain },
  { name: 'Literature', icon: FaBookOpen },
  { name: 'Physics', icon: FaRocket },
  { name: 'Economics', icon: FaChartLine }
];

// Updated sections for UniAi
const workflowSections = [
  {
    id: "overview",
    title: "Overview",
    description: "AI-powered university course planning for every degree",
    bgColor: "bg-white dark:bg-[#0B1120]"
  },
  {
    id: "course-planning",
    title: "Course Planning",
    description: "Complete degree roadmaps tailored to your university",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]",
    metrics: [
      { label: "Universities", value: "500+" },
      { label: "Degree Programs", value: "1000+" },
      { label: "Success Rate", value: "95%" }
    ]
  },
  {
    id: "lesson-generation",
    title: "Lesson Generation",
    description: "AI-generated lessons for every course in your program",
    bgColor: "bg-white dark:bg-[#0B1120]",
    metrics: [
      { label: "Lessons Created", value: "50K+" },
      { label: "Topics Covered", value: "10K+" },
      { label: "Study Time Saved", value: "40hrs/week" }
    ]
  },
  {
    id: "practice-tests",
    title: "Practice Tests",
    description: "Custom tests and quizzes to reinforce your learning",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]",
    metrics: [
      { label: "Test Questions", value: "100K+" },
      { label: "Pass Rate Increase", value: "35%" },
      { label: "Instant Feedback", value: "100%" }
    ]
  },
  {
    id: "progress-tracking",
    title: "Progress Tracking",
    description: "Monitor your academic journey and stay on track",
    bgColor: "bg-white dark:bg-[#0B1120]",
    metrics: [
      { label: "Progress Analytics", value: "Real-time" },
      { label: "Goal Setting", value: "Smart" },
      { label: "Graduation Prep", value: "Guided" }
    ]
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Affordable plans for every student's budget",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]"
  }
];

// Custom Hook to create section progress values
function useSectionProgressValues(numSections: number) {
  const { scrollYProgress } = useScroll();
  
  // Create all transforms at once, at the top level
  const section1Progress = useTransform(
    scrollYProgress,
    [0 / numSections, 1 / numSections],
    [0, 1]
  );
  const section2Progress = useTransform(
    scrollYProgress,
    [1 / numSections, 2 / numSections],
    [0, 1]
  );
  const section3Progress = useTransform(
    scrollYProgress,
    [2 / numSections, 3 / numSections],
    [0, 1]
  );
  const section4Progress = useTransform(
    scrollYProgress,
    [3 / numSections, 4 / numSections],
    [0, 1]
  );

  return [section1Progress, section2Progress, section3Progress, section4Progress];
}

// Updated feature cards for UniAi
const featureCards = [
  {
    title: "Smart Course Planning",
    description: "AI-generated degree roadmaps with prerequisites",
    icon: <GraduationCap className="h-6 w-6 text-primary" />,
    bgGradient: "from-blue-500/10 to-purple-500/10"
  },
  {
    title: "Interactive Lessons",
    description: "Engaging content for every course topic",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    bgGradient: "from-green-500/10 to-emerald-500/10"
  },
  {
    title: "Custom Testing",
    description: "Personalized practice tests and quizzes",
    icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
    bgGradient: "from-orange-500/10 to-red-500/10"
  },
  {
    title: "AI Tutoring",
    description: "Get help whenever you're stuck",
    icon: <Brain className="h-6 w-6 text-primary" />,
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    title: "Goal Tracking",
    description: "Stay motivated with progress tracking",
    icon: <Target className="h-6 w-6 text-primary" />,
    bgGradient: "from-cyan-500/10 to-blue-500/10"
  },
  {
    title: "Study Groups",
    description: "Connect with classmates and study together",
    icon: <Users className="h-6 w-6 text-primary" />,
    bgGradient: "from-indigo-500/10 to-purple-500/10"
  }
];

export default function LandingPage() {
  const { isInTrial } = useTrialStatus();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionProgressValues = useSectionProgressValues(workflowSections.length);
  
  const router = useRouter();

  const [dashboardRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const { scrollYProgress } = useScroll();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] relative">
      {/* Enhanced Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-darker/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 overflow-x-auto hide-scrollbar">
            {workflowSections.map((section, index) => (
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
                    ? 'text-primary dark:text-primary-light' 
                    : 'text-slate-600 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-primary-light'}`}
                >
                  {section.title}
                </span>
              </ScrollLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section - UniAi Overview */}
      <div id="overview" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-accent-light/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-20 pb-16 sm:pb-24">
            {/* Header Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <FaGraduationCap className="h-12 w-12 text-primary mr-4" />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
                  UniAi
                </h1>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
                AI-Powered University Course Planning
              </h2>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                Generate complete degree roadmaps, create interactive lessons for every course, 
                and practice with custom tests. Your personal AI study companion for university success.
              </p>
              
              {/* Key Benefits */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaClock className="mr-2 text-primary" />
                  Save 40+ hours per week
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaAward className="mr-2 text-primary" />
                  Improve grades by 35%
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FaUsers className="mr-2 text-primary" />
                  Join 50,000+ students
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Watch Demo
                </motion.button>
                <button 
                  onClick={() => router.push('/login')} 
                  className="px-8 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Combined Preview: Code + Workflow Steps */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Code Preview - Educational Theme */}
              <div className="relative">
                <pre className="relative rounded-xl bg-slate-900 p-8 shadow-2xl">
                  <code className="text-sm sm:text-base text-slate-100">
                    <TypewriterEffect text={`// 🎓 Your AI Study Assistant
import { useUniAi } from '@/hooks/education';

export const StudentLife = () => {
  const { courses, lessons, tests } = useUniAi();
  
  return (
    <div className="university-success">
      <CoursePlan degree="Computer Science" />
      <LessonGenerator topic="Data Structures" />
      <CustomTest subject="Algorithms" />
      
      <Status>
        {courses.completed}% Complete
        Grade: {calculateGPA(tests)} 📈
      </Status>
    </div>
  );`} />
                  </code>
                </pre>
              </div>

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

            {/* Feature Cards Grid */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-12">
                Everything You Need to Succeed
              </h3>
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
        </div>
      </div>

      {/* Other sections */}
      {workflowSections.slice(1).map((section, index) => (
        <motion.section
          key={section.id}
          id={section.id}
          className={`py-20 ${section.bgColor}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          onViewportEnter={() => setActiveSection(section.id)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                {section.description}
              </p>
            </div>

            {/* Clean Metrics Display */}
            {section.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {section.metrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  >
                    <div className="text-3xl font-bold text-primary mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pricing Section */}
            {section.id === "pricing" && <PricingSection />}
          </div>
        </motion.section>
      ))}

      {/* Enhanced CTA Section */}
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
                className="text-3xl font-bold text-slate-900 dark:text-white"
              >
                Ready to Transform Your University Experience?
              </motion.h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Join thousands of students who are already succeeding with UniAi
              </p>
              
              <div className="mt-10 flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Watch Demo
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial
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