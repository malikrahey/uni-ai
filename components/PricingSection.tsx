// File: /components/PricingSection.tsx

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const pricingTier = {
  id: "premium",
  name: "Premium Plan",
  price: "$9.99",
  interval: "/month",
  description: "Access to all features and unlimited learning",
  features: [
    "AI-generated personalized courses",
    "Interactive lessons and examples",
    "Custom practice tests and quizzes",
    "Progress tracking and analytics",
    "Multiple subjects and topics",
    "Learn at your own pace"
  ],
  cta: "Start Learning Today",
  popular: true
};

export function PricingSection() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>("premium");

  const handleTierClick = (tierId: string) => {
    setSelectedTier(currentTier => currentTier === tierId ? null : tierId);
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/login');
  };

  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        onClick={() => handleTierClick(pricingTier.id)}
        className={`relative rounded-2xl p-8 shadow-lg cursor-pointer transition-all duration-300 max-w-md w-full ${
          selectedTier === pricingTier.id
            ? 'bg-primary/5 dark:bg-primary/10 ring-2 ring-primary transform scale-105'
            : 'bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50'
        }`}
      >
        {/* Popular badge */}
        {pricingTier.popular && (
          <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 text-sm bg-primary text-white rounded-full">
            Popular
          </span>
        )}
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{pricingTier.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">{pricingTier.price}</span>
          <span className="ml-1 text-slate-500 dark:text-slate-400">{pricingTier.interval}</span>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">{pricingTier.description}</p>
        <ul className="mt-8 space-y-4">
          {pricingTier.features.map((feature) => (
            <li key={feature} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
              <span className="text-slate-600 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCTAClick}
          className={`mt-8 w-full py-3 px-4 rounded-lg text-center font-medium transition-colors ${
            selectedTier === pricingTier.id
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {pricingTier.cta}
        </motion.button>
      </motion.div>
    </div>
  );
}