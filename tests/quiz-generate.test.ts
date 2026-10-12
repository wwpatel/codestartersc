import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateQuiz, type GenerateDeps } from '@/lib/quiz/generate';
import type Anthropic from '@anthropic-ai/sdk';

const VALID = {
  questions: [0, 1, 2, 3, 4].map((i) => ({
    question: `Q${i}?`,
    options: ['a', 'b', 'c', 'd'],
    correctIndex: i % 4,
    explanation: 'Because.',
  })),
};

function toolUseMessage(input: unknown): Anthropic.Message {
  return {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    model: 'test',
    stop_reason: 'tool_use',
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
    content: [{ type: 'tool_use', id: 'toolu_1', name: 'record_quiz', input }],
  } as Anthropic.Message;
}

function makeDeps(overrides?: Partial<GenerateDeps>) {
  const createMessage = vi.fn(async () => toolUseMessage(VALID));
  const fetchTranscript = vi.fn(async () => 'a transcript');
  const deps: GenerateDeps = {
    fetchTranscript,
    createMessage,
    model: 'test-model',
    ...overrides,
  };
  return { deps, createMessage, fetchTranscript };
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
});
afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('generateQuiz', () => {
  it('returns no_captions when the transcript is null and never calls the model', async () => {
    const fetchNull = vi.fn(async () => null);
    const { deps, createMessage } = makeDeps({ fetchTranscript: fetchNull });
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('no_captions');
    expect(res.questions).toEqual([]);
    expect(createMessage).not.toHaveBeenCalled();
    expect(fetchNull).toHaveBeenCalledWith('vid');
  });

  it('returns ready with 5 questions on a valid tool_use output', async () => {
    const { deps } = makeDeps();
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('ready');
    expect(res.questions).toHaveLength(5);
    expect(res.questions[0]).toMatchObject({ choices: ['a', 'b', 'c', 'd'], answer_index: 0 });
  });

  it('retries once with an is_error tool_result and succeeds', async () => {
    const createMessage = vi
      .fn()
      .mockResolvedValueOnce(toolUseMessage({ questions: [] }))
      .mockResolvedValueOnce(toolUseMessage(VALID));
    const { deps } = makeDeps({ createMessage });
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('ready');
    expect(createMessage).toHaveBeenCalledTimes(2);
    const secondCall = createMessage.mock.calls[1][0] as Anthropic.MessageCreateParamsNonStreaming;
    const retryUser = secondCall.messages.at(-1);
    expect(retryUser?.role).toBe('user');
    const block = Array.isArray(retryUser?.content) ? retryUser.content[0] : null;
    expect(block).toMatchObject({ type: 'tool_result', tool_use_id: 'toolu_1', is_error: true });
  });

  it('returns failed when invalid twice', async () => {
    const createMessage = vi.fn(async () => toolUseMessage({ questions: [] }));
    const { deps } = makeDeps({ createMessage });
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('failed');
    expect(res.error).toBe('The model returned an invalid quiz twice.');
    expect(createMessage).toHaveBeenCalledTimes(2);
  });

  it('returns failed when the transcript fetch throws', async () => {
    const { deps } = makeDeps({
      fetchTranscript: vi.fn(async () => {
        throw new Error('bot check');
      }),
    });
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('failed');
    expect(res.error).toBe('bot check');
  });

  it('returns failed when the model call throws', async () => {
    const { deps } = makeDeps({
      createMessage: vi.fn(async () => {
        throw new Error('rate limited');
      }),
    });
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('failed');
    expect(res.error).toBe('rate limited');
  });

  it('fails fast without an API key and calls nothing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { deps, createMessage, fetchTranscript } = makeDeps();
    const res = await generateQuiz('vid', deps);
    expect(res.status).toBe('failed');
    expect(res.error).toBe('ANTHROPIC_API_KEY is not set.');
    expect(createMessage).not.toHaveBeenCalled();
    expect(fetchTranscript).not.toHaveBeenCalled();
  });
});
