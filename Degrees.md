# Degrees

collections of courses generally each degree will have 30. Some of these courses will be of the same topic
but with different specifications or difficulties

each degree will have (but not limited to):
1. name
2. description
3. icon
4. list of courses

# Courses

collection of lessons, each lesson should cover a different topic within the course

each course will have (but not limited to):
1. name
2. description
3. icon
4. list of lessons


# Lessons

Long articles teaching about a topic within a course

each lesson will have (but not limited to):
1. name
2. description
3. icon
4. content
5. Test

# Tests

Each lesson will have a short test associated with it. The test should be questions about the content in the lesson
Each question will have two different types of answers, numeric or multiple choice

Each test will have a list of questions with the following schema
{
    question: string
    answerType: 'multple choice' | 'numeric',
    options?: string[]
    answer: number (either the numeric answer or index of the answer)
}
