# Course Generation Utils

This module provides OpenAI-powered functions for generating educational content at different levels of the curriculum hierarchy.

## Setup

1. **Install OpenAI package:**
   ```bash
   npm install openai
   ```

2. **Set environment variable:**
   Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Functions

### `generateDegreeOutline()`

Generates a complete curriculum outline for a degree program.

**Parameters:**
- `degreeName` (string): Name of the degree (e.g., "Computer Science - Full Degree")
- `degreeDescription` (string): Description of the degree program
- `targetLevel` (string, optional): Complexity level, defaults to 'comprehensive'
- `courseCount` (number, optional): Number of courses to generate, defaults to 8

**Returns:** Array of `CourseTemplate` objects

**Usage:**
```typescript
const courses = await generateDegreeOutline(
  "Computer Science - Full Degree",
  "Comprehensive computer science education covering programming, algorithms, and software engineering",
  "comprehensive",
  8
);
```

### `generateCourseOutline()`

Generates a detailed lesson plan for a specific course.

**Parameters:**
- `courseName` (string): Name of the course
- `courseDescription` (string): Description of the course content
- `degreeContext` (string): The degree this course belongs to
- `lessonCount` (number, optional): Number of lessons to generate, defaults to 12

**Returns:** Array of `LessonTemplate` objects

**Usage:**
```typescript
const lessons = await generateCourseOutline(
  "Introduction to Programming",
  "Learn fundamental programming concepts using Python",
  "Computer Science",
  12
);
```

### `generateCourseLesson()`

Generates complete lesson content including educational material and assessment questions.

**Parameters:**
- `lessonName` (string): Name of the lesson
- `lessonDescription` (string): Brief description of lesson content
- `courseName` (string): Course this lesson belongs to
- `degreeContext` (string): Degree context for relevance
- `lessonOrder` (number): Position of lesson in course (0-based)
- `difficulty` (string, optional): Difficulty level, defaults to 'intermediate'

**Returns:** `LessonContent` object with content and test

**Usage:**
```typescript
const lessonContent = await generateCourseLesson(
  "Variables and Data Types",
  "Introduction to programming variables and basic data types",
  "Introduction to Programming",
  "Computer Science",
  0,
  "beginner"
);
```

## Data Structures

### CourseTemplate
```typescript
interface CourseTemplate {
  name: string;
  description: string;
  icon: string;
  estimatedDuration: string;
  prerequisites?: string[];
  learningObjectives: string[];
}
```

### LessonTemplate
```typescript
interface LessonTemplate {
  name: string;
  description: string;
  icon: string;
  estimatedReadingTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
}
```

### LessonContent
```typescript
interface LessonContent {
  content: string; // Markdown formatted lesson content
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
```

## Error Handling

All functions include fallback mechanisms that generate template-based content if the OpenAI API fails. This ensures the application continues to work even if:

- OpenAI API is unavailable
- API key is invalid or missing
- Rate limits are exceeded
- Network issues occur

## Integration with API Routes

These functions are automatically integrated with the existing API routes:

- `/api/degrees/[id]/generate-courses` - Uses `generateDegreeOutline()`
- `/api/courses/[id]/generate-lessons` - Uses `generateCourseOutline()`
- `/api/lessons/[id]/generate-content` - Uses `generateCourseLesson()`

## Notes

- Content generation is contextual and improves based on the provided degree and course information
- The system automatically creates test questions that align with lesson content
- All generated content follows educational best practices
- Content is formatted in Markdown for easy rendering 