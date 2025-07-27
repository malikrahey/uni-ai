// Educational platform type definitions

export interface Degree {
  id: string;
  name: string;
  description: string;
  icon?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  courses?: Course[];
  course_count?: number;
  progress_percentage?: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  icon?: string;
  degree_id?: string | null;
  is_standalone: boolean;
  course_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  lessons?: Lesson[];
  lesson_count?: number;
  progress_percentage?: number;
  degree?: Degree;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  icon?: string;
  content: string;
  course_id: string;
  lesson_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  test?: Test;
  course?: Course;
  user_progress?: UserLessonProgress;
  is_completed?: boolean;
}

export interface Test {
  id: string;
  lesson_id: string;
  questions: Question[];
  created_at: string;
  updated_at: string;
  // Computed fields
  lesson?: Lesson;
}

export interface Question {
  question: string;
  answerType: 'multiple choice' | 'numeric';
  options?: string[];
  answer: number; // Index for multiple choice, actual number for numeric
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  test_score?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  lesson?: Lesson;
}

// API Response types
export interface HomeContentResponse {
  degrees: Degree[];
  standaloneCourses: Course[];
  userProgress: {
    totalLessonsCompleted: number;
    totalTestsCompleted: number;
    averageTestScore: number;
  };
}

export interface DegreeDetailResponse {
  degree: Degree;
  courses: Course[];
  userProgress: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  };
}

export interface CourseDetailResponse {
  course: Course;
  lessons: Lesson[];
  userProgress: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  };
}

// Form types for creation/editing
export interface CreateDegreeForm {
  name: string;
  description: string;
  icon?: string;
}

export interface CreateCourseForm {
  name: string;
  description: string;
  icon?: string;
  degree_id?: string;
  is_standalone: boolean;
}

export interface CreateLessonForm {
  name: string;
  description: string;
  icon?: string;
  content: string;
  course_id: string;
}

export interface CreateTestForm {
  lesson_id: string;
  questions: Question[];
}

// Progress tracking types
export interface ProgressStats {
  totalDegrees: number;
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  completedTests: number;
  averageTestScore: number;
  currentStreak: number;
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  test_score?: number;
  completed_at?: string;
}

// Test taking types
export interface TestSubmission {
  lesson_id: string;
  answers: TestAnswer[];
}

export interface TestAnswer {
  questionIndex: number;
  answer: number | string;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: QuestionResult[];
  passed: boolean; // true if score >= 70%
}

export interface QuestionResult {
  questionIndex: number;
  question: string;
  userAnswer: number | string;
  correctAnswer: number | string;
  isCorrect: boolean;
}

// Utility types
export type SortOrder = 'asc' | 'desc';
export type CourseFilter = 'all' | 'standalone' | 'degree-courses';
export type ProgressFilter = 'all' | 'completed' | 'in-progress' | 'not-started';

export interface FilterOptions {
  search?: string;
  courseFilter?: CourseFilter;
  progressFilter?: ProgressFilter;
  sortBy?: 'name' | 'created_at' | 'progress' | 'course_order';
  sortOrder?: SortOrder;
} 