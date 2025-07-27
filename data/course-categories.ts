import { CourseCategory } from '@/types/course-creation';

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Programming, AI, cybersecurity, and digital skills',
    icon: '💻',
    difficulty: 'beginner-friendly',
    popularTopics: [
      'Python Programming',
      'Web Development',
      'Machine Learning',
      'Data Science',
      'React',
      'JavaScript',
      'Artificial Intelligence',
      'Cybersecurity',
      'Mobile App Development',
      'Cloud Computing'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Management, entrepreneurship, marketing, and finance',
    icon: '💼',
    difficulty: 'beginner-friendly',
    popularTopics: [
      'Digital Marketing',
      'Project Management',
      'Business Strategy',
      'Financial Analysis',
      'Entrepreneurship',
      'Leadership',
      'Sales',
      'Operations Management',
      'Business Analytics',
      'MBA Fundamentals'
    ]
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX, graphic design, and creative skills',
    icon: '🎨',
    difficulty: 'beginner-friendly',
    popularTopics: [
      'UI/UX Design',
      'Graphic Design',
      'Adobe Photoshop',
      'Figma',
      'Brand Design',
      'Web Design',
      'Product Design',
      'Typography',
      'Color Theory',
      'Design Systems'
    ]
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Physics, chemistry, biology, and research methods',
    icon: '🔬',
    difficulty: 'intermediate',
    popularTopics: [
      'Organic Chemistry',
      'Physics',
      'Biology',
      'Research Methods',
      'Statistics',
      'Environmental Science',
      'Biotechnology',
      'Neuroscience',
      'Genetics',
      'Scientific Writing'
    ]
  },
  {
    id: 'language',
    name: 'Languages',
    description: 'Learn new languages and improve communication',
    icon: '🌍',
    difficulty: 'beginner-friendly',
    popularTopics: [
      'Spanish',
      'French',
      'German',
      'Mandarin Chinese',
      'Japanese',
      'English (ESL)',
      'Italian',
      'Portuguese',
      'Korean',
      'Arabic'
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Humanities',
    description: 'History, literature, philosophy, and creative arts',
    icon: '📚',
    difficulty: 'beginner-friendly',
    popularTopics: [
      'Creative Writing',
      'Philosophy',
      'Art History',
      'Literature',
      'Music Theory',
      'Photography',
      'Film Studies',
      'Cultural Studies',
      'Ethics',
      'Classical Studies'
    ]
  },
  {
    id: 'health',
    name: 'Health & Medicine',
    description: 'Medical sciences, nutrition, and wellness',
    icon: '⚕️',
    difficulty: 'advanced',
    popularTopics: [
      'Anatomy',
      'Nutrition',
      'Public Health',
      'Mental Health',
      'Medical Terminology',
      'Pharmacology',
      'Healthcare Management',
      'Fitness Training',
      'Wellness Coaching',
      'Medical Research'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Mechanical, electrical, civil, and software engineering',
    icon: '⚙️',
    difficulty: 'advanced',
    popularTopics: [
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Software Engineering',
      'Chemical Engineering',
      'Robotics',
      'CAD Design',
      'Systems Engineering',
      'Materials Science',
      'Environmental Engineering'
    ]
  }
];

export const TRENDING_TOPICS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Digital Marketing',
  'UI/UX Design',
  'Python Programming',
  'Data Science',
  'Blockchain',
  'Cloud Computing',
  'Project Management',
  'Cybersecurity',
  'React Development',
  'Business Analytics'
];

export const SUGGESTED_TOPICS_BY_PLAN = {
  'crash-course': [
    'Excel Mastery',
    'Public Speaking',
    'Time Management',
    'LinkedIn Marketing',
    'PowerPoint Design',
    'Basic Coding',
    'Photography Basics',
    'Video Editing'
  ],
  'course': [
    'Full Stack Development',
    'Digital Marketing Complete',
    'Data Analysis',
    'UI/UX Design',
    'Business Management',
    'Graphic Design',
    'Language Learning',
    'Creative Writing'
  ],
  'full-degree': [
    'Computer Science',
    'Business Administration',
    'Psychology',
    'Engineering',
    'Data Science',
    'Marketing',
    'Finance',
    'Design'
  ]
}; 