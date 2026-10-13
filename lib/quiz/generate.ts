import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchTranscript } from './transcript';
import { extractJson, parseQuizOutput, QUIZ_TOOL_INPUT_SCHEMA } from './schema';
import type { Quiz, QuizQuestion } from '@/lib/supabase/types';

export type QuizGenerationResult =
  | { status: 'ready'; questions: QuizQuestion[]; error: null }
  | { status: 'no_captions'; questions: []; error: null }
  | { status: 'failed'; questions: []; error: string };

export interface GenerateDeps {
  fetchTranscript: (id: string) => Promise<string | null>;
  createMessage: (
    params: Anthropic.MessageCreateParamsNonStreaming,
  ) => Promise<Anthropic.Message>;
  model: string;
}

const SYSTEM_PROMPT =
  'You write short quizzes for students who just watched a lesson video. Use only facts that are stated in the transcript. Never rely on outside knowledge. Write in plain English for teenagers. Do not mention the transcript or the video itself in the questions.';

function userPrompt(transcript: string) {
  return `Transcript of the video:\n\n<transcript>\n${transcript}\n</transcript>\n\nWrite exactly 5 multiple-choice questions about what this video teaches. Each question has exactly 4 options, exactly one correct answer (correctIndex 0 to 3, vary the position across questions), and a one-sentence explanation of why the correct answer is right, based only on the transcript. Call the record_quiz tool with the finished quiz. Do not answer in plain text.`;
}

const TOOLS = [
  {
    name: 'record_quiz',
    description: 'Record the finished five-question quiz.',
    input_schema: QUIZ_TOOL_INPUT_SCHEMA,
  },
] as unknown as Anthropic.Tool[];

function truncate(message: string) {
  return message.slice(0, 500);
}

function questionInputFrom(message: Anthropic.Message): unknown {
  const toolUse = message.content.find((b) => b.type === 'tool_use');
  if (toolUse && toolUse.type === 'tool_use') return toolUse.input;
  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
  return extractJson(text);
}

function retryMessages(
  first: Anthropic.Message,
  error: string,
): Anthropic.MessageParam[] {
  const correction = `Invalid quiz: ${error}. Call record_quiz again with a corrected quiz that follows the schema exactly.`;
  const toolUse = first.content.find((b) => b.type === 'tool_use');
  if (toolUse && toolUse.type === 'tool_use') {
    return [
      { role: 'assistant', content: first.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            is_error: true,
            content: correction,
          },
        ],
      },
    ];
  }
  return [
    { role: 'assistant', content: first.content },
    { role: 'user', content: correction },
  ];
}

function defaultDeps(): GenerateDeps {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const client = new Anthropic({ apiKey, timeout: 50_000, maxRetries: 0 });
  return {
    fetchTranscript,
    createMessage: (params) => client.messages.create(params),
    model: process.env.QUIZ_MODEL || 'claude-sonnet-5-5',
  };
}

export async function generateQuiz(
  videoId: string,
  deps: Partial<GenerateDeps> = {},
): Promise<QuizGenerationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: 'failed', questions: [], error: 'ANTHROPIC_API_KEY is not set.' };
  }
  const d = { ...defaultDeps(), ...deps };

  try {
    const transcript = await d.fetchTranscript(videoId);
    if (!transcript) {
      return { status: 'no_captions', questions: [], error: null };
    }

    const baseParams: Omit<Anthropic.MessageCreateParamsNonStreaming, 'messages'> = {
      model: d.model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      tool_choice: { type: 'auto' },
    };

    const first = await d.createMessage({
      ...baseParams,
      messages: [{ role: 'user', content: userPrompt(transcript) }],
    });

    const firstParsed = parseQuizOutput(questionInputFrom(first));
    if (firstParsed.ok) {
      return { status: 'ready', questions: firstParsed.questions, error: null };
    }

    const second = await d.createMessage({
      ...baseParams,
      messages: [
        { role: 'user', content: userPrompt(transcript) },
        ...retryMessages(first, firstParsed.error),
      ],
    });

    const secondParsed = parseQuizOutput(questionInputFrom(second));
    if (secondParsed.ok) {
      return { status: 'ready', questions: secondParsed.questions, error: null };
    }

    return {
      status: 'failed',
      questions: [],
      error: 'The model returned an invalid quiz twice.',
    };
  } catch (err) {
    console.error('quiz: generation failed', err);
    return {
      status: 'failed',
      questions: [],
      error: truncate(err instanceof Error ? err.message : String(err)),
    };
  }
}

export async function generateAndStoreQuiz(
  supabase: SupabaseClient,
  lessonId: string,
  videoId: string,
  transcript?: string,
): Promise<Quiz> {
  const result = await generateQuiz(
    videoId,
    transcript ? { fetchTranscript: async () => transcript } : {},
  );

  const { error: upsertError } = await supabase.from('quizzes').upsert(
    {
      lesson_id: lessonId,
      status: result.status,
      questions: result.questions,
      error: result.error,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'lesson_id' },
  );
  if (upsertError) throw upsertError;

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .single();
  if (error) throw error;
  return data as Quiz;
}
