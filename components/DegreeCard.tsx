import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import type { Degree } from '@/types/education';

interface DegreeCardProps {
  degree: Degree;
}

export function DegreeCard({ degree }: DegreeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/degrees/${degree.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            {degree.icon ? (
              <span className="text-2xl">{degree.icon}</span>
            ) : (
              <GraduationCap className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words line-clamp-2">
              {degree.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {degree.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {degree.course_count || 0} courses
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {degree.progress_percentage || 0}% complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${degree.progress_percentage || 0}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Click to view courses</span>
        <span>{new Date(degree.created_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
} 