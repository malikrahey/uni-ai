import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for generation responses
interface CourseTemplate {
  name: string;
  description: string;
  icon: string;
  estimatedDuration: string;
  prerequisites?: string[];
  learningObjectives: string[];
}

interface LessonTemplate {
  name: string;
  description: string;
  icon: string;
  estimatedReadingTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
}

interface LessonContent {
  content: string;
  test: {
    questions: Array<{
      question: string;
      answerType: 'multiple choice' | 'numeric';
      options?: string[];
      answer: number;
      explanation?: string;
    }>;
  };
}

export async function generateDegreeOutline(
  degreeName: string,
  degreeDescription: string,
  targetLevel: string = 'comprehensive',
  courseCount: number = 8
): Promise<CourseTemplate[]> {
  try {

    const systemPrompt = `
    <task>
    You are a curriculum designer for a university. You will be given a degree name, description, and target level.
    Your job is to generate a comprehensive course outline for the degree, equivalent to a degree that may be offered at a university. 
    </task>

    <guidelines>
    - Degrees are generally 4-5 years long, with 10 courses per year
    - Courses should progress in difficulty, with each course building on the previous ones
    </guidelines>

    <constraints>
    Return only valid JSON.
    </constraints>

    <input_format>
    {
      "degreeName": "Degree Name",
      "degreeDescription": "Degree description",
      "targetLevel": "beginner" | "intermediate" | "advanced" | "professional"
    }
    </input_format>

    <response_format>
    {
      "courses": [
        {
          "name": "Course Name",
          "description": "Course description",
          "icon": "📚",
          "estimatedDuration": "8-10 weeks",
          "prerequisites": [],
          "learningObjectives": ["objective1", "objective2"]
        }
      ]
    }
    </response_format>

    `;

    const prompt = JSON.stringify({
      degreeName: degreeName,
      degreeDescription: degreeDescription,
      targetLevel: targetLevel,
      courseCount: courseCount
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed.courses || [];

  } catch (error) {
    console.error('Error generating degree outline:', error);
    return generateFallbackCourses(degreeName, courseCount);
  }
}

export async function generateCourseOutline(
  courseName: string,
  courseDescription: string,
  degreeContext: string,
  lessonCount: number = 12,
  expertiseLevel: string = "intermediate"
): Promise<LessonTemplate[]> {
  try {
    const systemPrompt = `
    <task>
    You are a curriculum designer for a university. You will be given a course name, description, and degree context.
    Your job is to generate a comprehensive course outline for the course, equivalent to a course that may be offered at a university. 
    </task>

    <guidelines>
    - Courses are generally 12-16 weeks long, with 12-16 lessons
    - Lessons should progress in difficulty, with each lesson building on the previous ones
    </guidelines>

    <input_format>
    {
      "courseName": "Course Name",
      "courseDescription": "Course description",
      "degreeContext": "Degree context",
      "expertiseLevel": "beginner" | "intermediate" | "advanced" | "professional",
      "lessonCount": 12
    }
    </input_format>

    <response_format>
    {
      "lessons": [
        {
          "name": "Lesson Name",
          "description": "Lesson description",
          "icon": "📝",
          "estimatedReadingTime": "15-20 minutes",
          "difficulty": "beginner",
          "learningObjectives": ["objective1", "objective2"]
        }
      ]
    }
    </response_format>
    
    
    
    `;

    const prompt = JSON.stringify(
      {
        courseName: courseName,
        courseDescription: courseDescription,
        degreeContext: degreeContext,
        expertiseLevel: expertiseLevel,
        lessonCount: lessonCount
      }
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed.lessons || [];

  } catch (error) {
    console.error('Error generating course outline:', error);
    return generateFallbackLessons(courseName, lessonCount);
  }
}

export async function generateCourseLesson(
  lessonName: string,
  lessonDescription: string,
  courseName: string,
  degreeContext: string,
  lessonOrder: number,
  difficulty: string = 'intermediate'
): Promise<LessonContent> {
  try {
    const prompt = `Generate lesson content and test for "${lessonName}".

Return JSON with this structure:
{
  "content": "# Lesson Title\\n\\nLesson content in markdown...",
  "test": {
    "questions": [
      {
        "question": "Question text?",
        "answerType": "multiple choice",
        "options": ["A", "B", "C", "D"],
        "answer": 0,
        "explanation": "Why this is correct."
      }
    ]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an educator. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return {
      content: parsed.content || generateFallbackContent(lessonName, lessonDescription, courseName),
      test: parsed.test || generateFallbackTest(lessonName)
    };

  } catch (error) {
    console.error('Error generating lesson content:', error);
    return {
      content: generateFallbackContent(lessonName, lessonDescription, courseName),
      test: generateFallbackTest(lessonName)
    };
  }
}

// Fallback functions
function generateFallbackCourses(degreeName: string, count: number): CourseTemplate[] {
  const subject = degreeName.split(' -')[0];
  const templates = [
    { name: 'Fundamentals', icon: '📚', description: 'Core foundational concepts' },
    { name: 'Beginner Essentials', icon: '🌱', description: 'Essential skills for beginners' },
    { name: 'Intermediate Concepts', icon: '📈', description: 'Building on fundamental knowledge' },
    { name: 'Advanced Topics', icon: '🎯', description: 'Complex and specialized areas' },
    { name: 'Practical Applications', icon: '🛠️', description: 'Real-world applications' },
    { name: 'Professional Skills', icon: '💼', description: 'Industry-relevant skills' },
    { name: 'Specialized Areas', icon: '🔬', description: 'Focused specialization topics' },
    { name: 'Capstone Project', icon: '🏆', description: 'Comprehensive final project' }
  ];

  return templates.slice(0, count).map((template, index) => ({
    name: `${subject} ${template.name}`,
    description: `${template.description} in ${subject.toLowerCase()}`,
    icon: template.icon,
    estimatedDuration: '8-10 weeks',
    prerequisites: index > 0 ? [`${subject} ${templates[index - 1].name}`] : [],
    learningObjectives: [
      `Understand core ${template.name.toLowerCase()} concepts`,
      `Apply ${template.name.toLowerCase()} in practical scenarios`
    ]
  }));
}

function generateFallbackLessons(courseName: string, count: number): LessonTemplate[] {
  const templates = [
    { name: 'Introduction', icon: '🚀', difficulty: 'beginner' as const },
    { name: 'Basic Concepts', icon: '📝', difficulty: 'beginner' as const },
    { name: 'Core Principles', icon: '⚖️', difficulty: 'intermediate' as const },
    { name: 'Practical Examples', icon: '💡', difficulty: 'intermediate' as const },
    { name: 'Advanced Techniques', icon: '🎯', difficulty: 'advanced' as const },
    { name: 'Best Practices', icon: '⭐', difficulty: 'advanced' as const }
  ];

  return templates.slice(0, count).map((template, index) => ({
    name: `Lesson ${(index + 1).toString().padStart(2, '0')}: ${template.name}`,
    description: `${template.name} for ${courseName}`,
    icon: template.icon,
    estimatedReadingTime: '20-25 minutes',
    difficulty: template.difficulty,
    learningObjectives: [
      `Understand ${template.name.toLowerCase()} concepts`,
      `Apply ${template.name.toLowerCase()} techniques`
    ]
  }));
}

function generateFallbackContent(lessonName: string, description: string, courseName: string): string {
  return `# ${lessonName}

## Overview

${description}

This lesson is part of **${courseName}** and covers essential concepts.

## Learning Objectives

- 📚 Understand core concepts
- 🎯 Apply knowledge practically
- 💡 Connect to broader themes

## Key Concepts

The main concepts include understanding and applying the principles of ${lessonName.toLowerCase()}.

## Summary

Review these concepts and complete the assessment to test your understanding.`;
}

function generateFallbackTest(lessonName: string) {
  return {
    questions: [
      {
        question: `What is the main focus of ${lessonName}?`,
        answerType: 'multiple choice' as const,
        options: [
          'Understanding core concepts',
          'Memorizing definitions',
          'Completing assignments',
          'Reading materials'
        ],
        answer: 0,
        explanation: 'The main focus is understanding core concepts.'
      },
      {
        question: 'On a scale of 1-10, how important is practice?',
        answerType: 'numeric' as const,
        answer: 9,
        explanation: 'Practice is crucial for mastering concepts.'
      }
    ]
  };
}