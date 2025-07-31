import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Degrees | Acceluni',
  description: 'Manage your degree programs and academic pathways',
};

export default function DegreesPage() {
  // This will redirect to the main page since degrees are shown on the home page
  // But we can also create a dedicated degrees page if needed
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Your Degrees
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          This page can be used for a dedicated degrees view, but degrees are currently displayed on the main dashboard.
        </p>
      </div>
    </div>
  );
} 