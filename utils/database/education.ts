import { supabase } from '../supabase';
import { supabaseAdmin } from '../supabase-admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Degree,
  Course,
  Lesson,
  Test,
  UserLessonProgress,
  CreateDegreeForm,
  CreateCourseForm,
  CreateLessonForm,
  CreateTestForm,
  HomeContentResponse,
  DegreeDetailResponse,
  CourseDetailResponse,
  TestSubmission,
  TestResult,
  Question,
  QuestionResult
} from '@/types/education';

// Degrees
export async function createDegree(data: CreateDegreeForm & { user_id: string }, client: SupabaseClient = supabase): Promise<Degree> {
  const { data: degree, error } = await client
    .from('degrees')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return degree;
}

export async function getUserDegrees(userId: string, client: SupabaseClient = supabase): Promise<Degree[]> {
  const { data: degrees, error } = await client
    .from('degrees')
    .select(`
      *,
      courses!courses_degree_id_fkey(
        id,
        name,
        description,
        course_order,
        lessons(
          id,
          lesson_status
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate progress for each degree using the new status field
  return await Promise.all(degrees.map(async (degree) => {
    const courseCount = degree.courses?.length || 0;
    let progressPercentage = 0;

    if (courseCount > 0) {
      // Calculate total lessons and completed lessons for this degree
      let totalLessons = 0;
      let completedLessons = 0;

      degree.courses?.forEach(course => {
        const lessonCount = course.lessons?.length || 0;
        const completedCount = course.lessons?.filter(l => l.lesson_status === 'COMPLETED').length || 0;
        totalLessons += lessonCount;
        completedLessons += completedCount;
      });

      if (totalLessons > 0) {
        progressPercentage = Math.round((completedLessons / totalLessons) * 100);
      }
    }

    return {
      ...degree,
      course_count: courseCount,
      progress_percentage: progressPercentage
    };
  }));
}

export async function getDegreeById(degreeId: string, userId: string, client: SupabaseClient = supabase): Promise<DegreeDetailResponse> {
  const { data: degree, error } = await client
    .from('degrees')
    .select('*')
    .eq('id', degreeId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  const { data: courses, error: coursesError } = await client
    .from('courses')
    .select(`
      *,
      lessons(
        id,
        name,
        lesson_order
      )
    `)
    .eq('degree_id', degreeId)
    .order('course_order', { ascending: true });

  if (coursesError) throw coursesError;

  // Calculate progress
  const { data: progressData } = await client
    .from('user_lesson_progress')
    .select(`
      completed,
      lessons!inner(
        courses!inner(
          degree_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.courses.degree_id', degreeId);

  const totalLessons = progressData?.length || 0;
  const completedLessons = progressData?.filter(p => p.completed).length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    degree,
    courses: courses || [],
    userProgress: {
      completedLessons,
      totalLessons,
      progressPercentage
    }
  };
}

// Courses
export async function createCourse(data: CreateCourseForm & { user_id: string; course_order?: number }, client: SupabaseClient = supabase): Promise<Course> {
  const { data: course, error } = await client
    .from('courses')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return course;
}

export async function getStandaloneCourses(userId: string, client: SupabaseClient = supabase): Promise<Course[]> {
  const { data: courses, error } = await client
    .from('courses')
    .select(`
      *,
      lessons(
        id,
        name,
        lesson_order,
        lesson_status
      )
    `)
    .eq('user_id', userId)
    .eq('is_standalone', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate progress for each course using the new status field
  return await Promise.all(courses.map(async (course) => {
    const lessonCount = course.lessons?.length || 0;
    let progressPercentage = 0;

    if (lessonCount > 0) {
      const completedLessons = course.lessons?.filter(l => l.lesson_status === 'COMPLETED').length || 0;
      progressPercentage = Math.round((completedLessons / lessonCount) * 100);
    }

    return {
      ...course,
      lesson_count: lessonCount,
      progress_percentage: progressPercentage
    };
  }));
}

export async function getCourseById(courseId: string, userId: string, client: SupabaseClient = supabase): Promise<CourseDetailResponse> {
  const { data: course, error } = await client
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  const { data: lessons, error: lessonsError } = await client
    .from('lessons')
    .select(`
      *,
      tests(id, questions),
      user_lesson_progress!user_lesson_progress_lesson_id_fkey(
        test_score,
        completed_at
      )
    `)
    .eq('course_id', courseId)
    .order('lesson_order', { ascending: true });

  if (lessonsError) throw lessonsError;

  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter(lesson => 
    lesson.lesson_status === 'COMPLETED'
  ).length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Add generation status to course
  const courseWithStatus = {
    ...course,
    is_generated: totalLessons > 0
  };

  return {
    course: courseWithStatus,
    lessons: lessons || [],
    userProgress: {
      completedLessons,
      totalLessons,
      progressPercentage
    }
  };
}

// Lessons
export async function createLesson(data: CreateLessonForm & { lesson_order: number }, client: SupabaseClient = supabase): Promise<Lesson> {
  const lessonData = {
    ...data,
    lesson_status: data.lesson_status || 'STARTED' // Default to STARTED when lesson is created
  };

  const { data: lesson, error } = await client
    .from('lessons')
    .insert([lessonData])
    .select()
    .single();

  if (error) throw error;
  return lesson;
}

export async function getLessonById(lessonId: string, userId: string, client: SupabaseClient = supabase): Promise<Lesson> {
  const { data: lesson, error } = await client
    .from('lessons')
    .select(`
      *,
      courses!inner(user_id),
      tests(
        id,
        lesson_id,
        questions,
        created_at,
        updated_at
      ),
      user_lesson_progress!user_lesson_progress_lesson_id_fkey(
        test_score,
        completed_at
      )
    `)
    .eq('id', lessonId)
    .eq('courses.user_id', userId)
    .single();

  if (error) {
    throw error;
  }

  // Transform the tests array into a single test object (lessons should have at most one test)
  const rawLesson = lesson as any; // Type assertion to handle the tests array from Supabase
  let testData = rawLesson.tests && rawLesson.tests.length > 0 ? rawLesson.tests[0] : null;

  // If no test was found through the join, try fetching it directly
  if (!testData) {
    try {
      testData = await getTestByLessonId(lessonId, userId, client);
    } catch (error) {
      // Not a critical error, continue without test
    }
  }

  const transformedLesson: Lesson = {
    ...rawLesson,
    test: testData,
    user_progress: rawLesson.user_lesson_progress && rawLesson.user_lesson_progress.length > 0 
      ? rawLesson.user_lesson_progress[0] 
      : null,
    is_completed: rawLesson.lesson_status === 'COMPLETED'
  };

  // Remove the array properties since we're using singular forms
  delete (transformedLesson as any).tests;
  delete (transformedLesson as any).user_lesson_progress;

  return transformedLesson;
}

// Tests
export async function createTest(data: CreateTestForm, client: SupabaseClient = supabase): Promise<Test> {
  const { data: test, error } = await client
    .from('tests')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return test;
}

export async function getTestByLessonId(lessonId: string, userId: string, client: SupabaseClient = supabase): Promise<Test | null> {
  const { data: test, error } = await client
    .from('tests')
    .select(`
      *,
      lessons!inner(
        courses!inner(user_id)
      )
    `)
    .eq('lesson_id', lessonId)
    .eq('lessons.courses.user_id', userId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return test;
}

export async function submitTest(submission: TestSubmission, userId: string, client: SupabaseClient = supabase): Promise<TestResult> {
  // Get the test data
  const { data: test, error: testError } = await client
    .from('tests')
    .select(`
      *,
      lessons!inner(
        courses!inner(user_id)
      )
    `)
    .eq('lesson_id', submission.lesson_id)
    .eq('lessons.courses.user_id', userId)
    .single();

  if (testError) throw testError;

  const questions: Question[] = test.questions;
  let correctAnswers = 0;
  const incorrectAnswers: QuestionResult[] = [];

  // Score the test
  submission.answers.forEach((answer, index) => {
    const question = questions[index];
    const isCorrect = answer.answer === question.answer;
    
    if (isCorrect) {
      correctAnswers++;
    } else {
      incorrectAnswers.push({
        questionIndex: index,
        question: question.question,
        userAnswer: answer.answer,
        correctAnswer: question.answer,
        isCorrect: false
      });
    }
  });

  const score = Math.round((correctAnswers / questions.length) * 100);
  const passed = score >= 70;

  // Update user progress for test score
  const { error: progressError } = await client
    .from('user_lesson_progress')
    .upsert([
      {
        user_id: userId,
        lesson_id: submission.lesson_id,
        test_score: score,
        completed_at: passed ? new Date().toISOString() : null
      }
    ]);

  if (progressError) throw progressError;

  // Update lesson status if test was passed
  if (passed) {
    const { error: lessonUpdateError } = await client
      .from('lessons')
      .update({
        lesson_status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('id', submission.lesson_id);

    if (lessonUpdateError) throw lessonUpdateError;
  }

  return {
    score,
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers,
    passed
  };
}

// Home page content
export async function getHomeContent(userId: string, client: SupabaseClient = supabase): Promise<HomeContentResponse> {
  const [degrees, standaloneCourses] = await Promise.all([
    getUserDegrees(userId, client),
    getStandaloneCourses(userId, client)
  ]);

  // Get user progress stats using the new status field
  const { data: lessons } = await client
    .from('lessons')
    .select('lesson_status, user_lesson_progress(test_score)')
    .eq('courses.user_id', userId);

  const totalLessonsCompleted = lessons?.filter(l => l.lesson_status === 'COMPLETED').length || 0;
  const totalTestsCompleted = lessons?.filter(l => l.user_lesson_progress?.[0]?.test_score !== null).length || 0;
  const averageTestScore = totalTestsCompleted > 0 
    ? Math.round(lessons!.reduce((sum, l) => {
        const testScore = l.user_lesson_progress?.[0]?.test_score || 0;
        return sum + testScore;
      }, 0) / totalTestsCompleted)
    : 0;

  return {
    degrees,
    standaloneCourses,
    userProgress: {
      totalLessonsCompleted,
      totalTestsCompleted,
      averageTestScore
    }
  };
}

// Progress tracking
export async function markLessonComplete(lessonId: string, userId: string, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client
    .from('lessons')
    .update({
      lesson_status: 'COMPLETED',
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId);

  if (error) throw error;
}

export async function markLessonStarted(lessonId: string, userId: string, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client
    .from('lessons')
    .update({
      lesson_status: 'STARTED',
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId)
    .eq('lesson_status', 'NOT_STARTED'); // Only update if not already started

  if (error) throw error;
}

export async function getUserProgress(userId: string, client: SupabaseClient = supabase): Promise<UserLessonProgress[]> {
  const { data: progress, error } = await client
    .from('user_lesson_progress')
    .select(`
      *,
      lessons(
        name,
        courses(
          name,
          degree_id,
          degrees(name)
        )
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return progress || [];
} 