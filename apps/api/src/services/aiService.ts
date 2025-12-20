// AI Service with support for multiple providers (OpenAI and Gemini)

// Lazy-initialize clients to allow server to start without API keys
let openaiClient: any = null;
let geminiClient: any = null;

export type AIProvider = 'openai' | 'gemini';

const getOpenAIClient = async (): Promise<any> => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. OpenAI features are unavailable.'
      );
    }
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

const getGeminiClient = async (): Promise<any> => {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is not set. Gemini features are unavailable.'
      );
    }
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
};

export interface GenerateArticleParams {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  courseDescription: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  previousLessons?: string[];
  provider?: AIProvider;
}

export interface GenerateQuizQuestionsParams {
  courseTitle: string;
  moduleTitle: string;
  articleContent: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  provider?: AIProvider;
}

export interface GeneratedQuestion {
  type: 'multiple-choice' | 'true-false' | 'multiple-select';
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface GenerateCourseOutlineParams {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string;
  numberOfModules: number;
  lessonsPerModule: number;
  provider?: AIProvider;
}

export interface CourseOutline {
  title: string;
  description: string;
  shortDescription: string;
  requirements: string[];
  outcomes: string[];
  modules: {
    title: string;
    description: string;
    lessons: {
      title: string;
      type: 'article' | 'quiz';
      description: string;
    }[];
  }[];
}

class AIService {
  private openaiModel = 'gpt-4o-mini';
  private geminiModel = 'gemini-1.5-flash';
  private defaultProvider: AIProvider = 'gemini'; // Default to Gemini

  /**
   * Get available providers based on configured API keys
   */
  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.GEMINI_API_KEY) providers.push('gemini');
    return providers;
  }

  /**
   * Get the best available provider
   */
  private getProvider(requested?: AIProvider): AIProvider {
    if (requested) {
      if (requested === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
      if (requested === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini';
    }
    // Fallback to default or first available
    if (process.env.GEMINI_API_KEY) return 'gemini';
    if (process.env.OPENAI_API_KEY) return 'openai';
    throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
  }

  /**
   * Generate content using Gemini
   */
  private async generateWithGemini(
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean = false
  ): Promise<string> {
    const client = await getGeminiClient();
    const model = client.getGenerativeModel({
      model: this.geminiModel,
      generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    });

    return result.response.text();
  }

  /**
   * Generate content using OpenAI
   */
  private async generateWithOpenAI(
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean = false,
    maxTokens: number = 3000
  ): Promise<string> {
    const client = await getOpenAIClient();
    const response = await client.chat.completions.create({
      model: this.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate article content for a lesson
   */
  async generateArticle(params: GenerateArticleParams): Promise<{ content: string; provider: AIProvider }> {
    const { courseTitle, moduleTitle, lessonTitle, courseDescription, level, previousLessons, provider } = params;
    const selectedProvider = this.getProvider(provider);

    const previousContext = previousLessons?.length
      ? `\n\nPrevious lessons in this module:\n${previousLessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}`
      : '';

    const systemPrompt = 'You are an expert educational content creator specializing in technology and digital skills training. Your content is clear, engaging, and practical.';

    const userPrompt = `Create a comprehensive, engaging lesson article for an online learning platform.

Course: ${courseTitle}
Course Description: ${courseDescription}
Module: ${moduleTitle}
Lesson Title: ${lessonTitle}
Difficulty Level: ${level}${previousContext}

Requirements:
1. Write in HTML format (use h2, h3, p, ul, ol, li, blockquote, strong, em, code tags)
2. Start with a brief introduction explaining what will be covered
3. Break down complex concepts into digestible sections
4. Include practical examples and code snippets where relevant
5. Add "Pro Tips" or "Key Takeaways" in blockquotes
6. End with a summary of key points
7. Make it engaging and suitable for ${level} level learners
8. Aim for 800-1200 words
9. Use clear headings and subheadings for easy navigation

Generate the complete lesson content in HTML format:`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt)
      : await this.generateWithOpenAI(systemPrompt, userPrompt);

    return { content, provider: selectedProvider };
  }

  /**
   * Generate quiz questions based on article content
   */
  async generateQuizQuestions(params: GenerateQuizQuestionsParams): Promise<{ questions: GeneratedQuestion[]; provider: AIProvider }> {
    const { courseTitle, moduleTitle, articleContent, numberOfQuestions, difficulty, provider } = params;
    const selectedProvider = this.getProvider(provider);

    const systemPrompt = 'You are an expert quiz creator. Always respond with valid JSON only, no markdown or additional text.';

    const userPrompt = `Generate ${numberOfQuestions} quiz questions based on the following lesson content.

Course: ${courseTitle}
Module: ${moduleTitle}
Difficulty: ${difficulty}

Lesson Content:
${articleContent}

Requirements:
1. Create a mix of question types:
   - multiple-choice (4 options, 1 correct)
   - true-false (2 options)
   - multiple-select (4 options, 2-3 correct)
2. Each question should test understanding, not just memorization
3. Include clear explanations for the correct answers
4. Distribute difficulty: ${difficulty === 'mixed' ? 'easy (30%), medium (50%), hard (20%)' : `all ${difficulty}`}
5. Assign points: easy=5, medium=10, hard=15

Return a JSON object with exactly this structure:
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Question text here?",
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Explanation of the correct answer",
      "difficulty": "easy",
      "points": 5
    }
  ]
}

Generate exactly ${numberOfQuestions} questions:`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt, true)
      : await this.generateWithOpenAI(systemPrompt, userPrompt, true, 4000);

    const parsed = JSON.parse(content);
    return { questions: parsed.questions || parsed, provider: selectedProvider };
  }

  /**
   * Generate a complete course outline
   */
  async generateCourseOutline(params: GenerateCourseOutlineParams): Promise<{ outline: CourseOutline; provider: AIProvider }> {
    const { topic, level, targetAudience, numberOfModules, lessonsPerModule, provider } = params;
    const selectedProvider = this.getProvider(provider);

    const systemPrompt = 'You are an expert curriculum designer. Always respond with valid JSON only.';

    const userPrompt = `Create a comprehensive course outline for an online learning platform.

Topic: ${topic}
Level: ${level}
Target Audience: ${targetAudience}
Number of Modules: ${numberOfModules}
Lessons per Module: ${lessonsPerModule}

Requirements:
1. Create a logical progression from basic to advanced concepts
2. Each module should have a clear focus area
3. Include a mix of article lessons and quiz lessons
4. Each module should end with a quiz lesson
5. Make titles clear and descriptive
6. Include practical, hands-on lessons where applicable

Return a JSON object with exactly this structure:
{
  "title": "Course Title",
  "description": "Detailed course description (2-3 paragraphs)",
  "shortDescription": "One-line course summary",
  "requirements": ["Prerequisite 1", "Prerequisite 2"],
  "outcomes": ["Learning outcome 1", "Learning outcome 2"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "lessons": [
        {"title": "Lesson Title", "type": "article", "description": "Brief lesson description"},
        {"title": "Module Quiz", "type": "quiz", "description": "Quiz description"}
      ]
    }
  ]
}`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt, true)
      : await this.generateWithOpenAI(systemPrompt, userPrompt, true, 4000);

    return { outline: JSON.parse(content), provider: selectedProvider };
  }

  /**
   * Improve existing article content
   */
  async improveArticle(
    currentContent: string,
    instructions: string,
    provider?: AIProvider
  ): Promise<{ content: string; provider: AIProvider }> {
    const selectedProvider = this.getProvider(provider);

    const systemPrompt = 'You are an expert content editor. Return only the improved HTML content.';

    const userPrompt = `Improve the following article based on the given instructions.

Current Article:
${currentContent}

Instructions:
${instructions}

Requirements:
1. Maintain the HTML format
2. Keep the core educational value
3. Apply the requested improvements
4. Ensure the content remains coherent and well-structured

Return the improved article in HTML format:`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt)
      : await this.generateWithOpenAI(systemPrompt, userPrompt, false, 4000);

    return { content, provider: selectedProvider };
  }

  /**
   * Generate additional questions for a course question bank
   */
  async generateQuestionBankQuestions(
    courseTitle: string,
    moduleTitle: string,
    topics: string[],
    existingQuestionsCount: number,
    newQuestionsCount: number,
    provider?: AIProvider
  ): Promise<{ questions: GeneratedQuestion[]; provider: AIProvider }> {
    const selectedProvider = this.getProvider(provider);

    const systemPrompt = 'You are an expert quiz creator. Return only valid JSON.';

    const userPrompt = `Generate ${newQuestionsCount} NEW quiz questions for a question bank.

Course: ${courseTitle}
Module: ${moduleTitle}
Topics to cover: ${topics.join(', ')}
Existing questions in bank: ${existingQuestionsCount}

Requirements:
1. Create diverse questions covering all topics
2. Mix of question types: multiple-choice (60%), true-false (20%), multiple-select (20%)
3. Distribute difficulty: easy (30%), medium (50%), hard (20%)
4. Questions should be unique and not overlap with existing ones
5. Focus on practical understanding and application

Return a JSON object with a "questions" array:
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Question text?",
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Why this is correct",
      "difficulty": "medium",
      "points": 10
    }
  ]
}`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt, true)
      : await this.generateWithOpenAI(systemPrompt, userPrompt, true, 4000);

    const parsed = JSON.parse(content);
    return { questions: parsed.questions || [], provider: selectedProvider };
  }

  // Generate custom content for students
  async generateCustomStudentContent(params: {
    courseTitle: string;
    courseDescription: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    studentPrompt: string;
    provider?: AIProvider;
  }): Promise<{ content: string; provider: AIProvider }> {
    const selectedProvider = this.selectProvider(params.provider);

    const systemPrompt = `You are an expert educational content creator and tutor. You're helping a student who is learning about "${params.courseTitle}".

Course Description: ${params.courseDescription}
Course Level: ${params.level}

Your task is to generate educational content that:
1. Is accurate, clear, and appropriate for ${params.level} level students
2. Includes practical examples and analogies when relevant
3. Is well-structured with clear headings and sections
4. Uses markdown formatting for better readability
5. Provides step-by-step explanations when necessary
6. Encourages learning and understanding, not just memorization

Generate content that directly addresses the student's request while staying relevant to the course topic.`;

    const userPrompt = `Student's request: ${params.studentPrompt}

Please generate comprehensive educational content that addresses this request. Make it engaging, informative, and helpful for their learning journey.`;

    const content = selectedProvider === 'gemini'
      ? await this.generateWithGemini(systemPrompt, userPrompt, false)
      : await this.generateWithOpenAI(systemPrompt, userPrompt, false, 2000);

    return { content, provider: selectedProvider };
  }
}

export const aiService = new AIService();
