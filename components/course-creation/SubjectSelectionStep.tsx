"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  ChevronRight,
  X,
  Check,
  ArrowRight,
  Filter,
  Star
} from 'lucide-react';
import { WizardStepProps, PlanType } from '@/types/course-creation';
import { COURSE_CATEGORIES, TRENDING_TOPICS, SUGGESTED_TOPICS_BY_PLAN } from '@/data/course-categories';

export default function SubjectSelectionStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  canGoNext,
  canGoBack
}: WizardStepProps) {
  const [searchTerm, setSearchTerm] = useState(formData.subject || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(formData.category || null);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get suggestions based on selected plan type
  const planSuggestions = formData.planType ? SUGGESTED_TOPICS_BY_PLAN[formData.planType] : [];

  // Generate search suggestions based on input
  useEffect(() => {
    if (searchTerm.length > 1) {
      const allTopics = COURSE_CATEGORIES.flatMap(cat => cat.popularTopics);
      const filtered = allTopics.filter(topic => 
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      setSearchSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Handle subject selection
  const handleSubjectSelect = (subject: string, category?: string) => {
    setSearchTerm(subject);
    setShowSuggestions(false);
    setShowCustomInput(false);
    onUpdate({ 
      subject, 
      category: category || selectedCategory || undefined 
    });
  };

  // Handle custom input
  const handleCustomInput = () => {
    if (customInput.trim()) {
      handleSubjectSelect(customInput.trim());
      setCustomInput('');
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      onUpdate({ category: undefined });
    } else {
      setSelectedCategory(categoryId);
      onUpdate({ category: categoryId });
    }
  };

  // Get filtered popular topics for selected category
  const getPopularTopics = () => {
    if (selectedCategory) {
      const category = COURSE_CATEGORIES.find(cat => cat.id === selectedCategory);
      return category?.popularTopics || [];
    }
    return TRENDING_TOPICS;
  };

  const handleContinue = () => {
    if (searchTerm) {
      onUpdate({ subject: searchTerm });
      onNext();
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          What do you want to learn?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose a subject or topic that interests you. We'll help you find the perfect learning path.
        </p>
      </div>

      {/* Plan Type Reminder */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Selected: {formData.planType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for a subject, skill, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-neutral-dark text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-dark border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubjectSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900 dark:text-white">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 text-center">
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COURSE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'
                    }`}>
                      {category.name}
                    </h4>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.difficulty === 'beginner-friendly'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : category.difficulty === 'intermediate'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {category.difficulty}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Popular/Trending Topics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {selectedCategory ? 'Popular in Category' : 'Trending Now'}
          </h3>
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Popular</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getPopularTopics().map((topic, index) => (
            <motion.button
              key={topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubjectSelect(topic, selectedCategory || undefined)}
              className={`
                p-3 rounded-lg border text-left transition-all duration-200 group
                ${searchTerm === topic
                  ? 'border-primary bg-primary/10 dark:bg-primary/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  searchTerm === topic 
                    ? 'text-primary' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {topic}
                </span>
                <ArrowRight className={`h-3 w-3 transition-transform group-hover:translate-x-1 ${
                  searchTerm === topic ? 'text-primary' : 'text-slate-400'
                }`} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Plan-Specific Suggestions */}
      {planSuggestions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Recommended for {formData.planType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {planSuggestions.map((topic, index) => (
              <motion.button
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubjectSelect(topic)}
                className={`
                  p-3 rounded-lg border-2 border-dashed text-center transition-all duration-200
                  ${searchTerm === topic
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                    : 'border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  }
                `}
              >
                <span className="text-sm font-medium">{topic}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Input Option */}
      <div className="mb-8">
        <div className="text-center">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-primary hover:text-primary-dark underline text-sm font-medium"
            >
              Don't see what you're looking for? Enter a custom topic
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="max-w-md mx-auto"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your custom topic..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomInput()}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-neutral-dark text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleCustomInput}
                  disabled={!customInput.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput('');
                  }}
                  className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Selected Subject Display */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              Selected: {searchTerm}
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                onUpdate({ subject: undefined, category: undefined });
              }}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
          disabled={!searchTerm}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 