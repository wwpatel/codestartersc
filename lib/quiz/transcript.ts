import {
  fetchTranscript as ytFetchTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript';

const MAX_CHARS = 60_000;
const TIMEOUT_MS = 15_000;

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function fetchSegments(videoId: string) {
  try {
    return await ytFetchTranscript(videoId, { lang: 'en' });
  } catch (err) {
    if (err instanceof YoutubeTranscriptNotAvailableLanguageError) {
      return await ytFetchTranscript(videoId);
    }
    throw err;
  }
}

export async function fetchTranscript(videoId: string): Promise<string | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const segments = await Promise.race([
    fetchSegments(videoId),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Transcript fetch timed out.')), TIMEOUT_MS);
    }),
  ])
    .catch((err) => {
      if (
        err instanceof YoutubeTranscriptDisabledError ||
        err instanceof YoutubeTranscriptNotAvailableError ||
        err instanceof YoutubeTranscriptVideoUnavailableError
      ) {
        return null;
      }
      throw err;
    })
    .finally(() => clearTimeout(timer));

  if (!segments || segments.length === 0) return null;

  const text = decodeEntities(segments.map((s) => s.text).join(' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return null;
  return text.slice(0, MAX_CHARS);
}
