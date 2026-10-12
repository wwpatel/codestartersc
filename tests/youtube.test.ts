import { describe, expect, it } from 'vitest';
import { parseYouTubeId, youtubeWatchUrl } from '@/lib/youtube';

const ID = 'aircAruvnKk';

describe('parseYouTubeId', () => {
  it('parses all accepted forms', () => {
    const cases = [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?v=${ID}&t=43s`,
      `https://www.youtube.com/watch?t=43s&v=${ID}&list=PLxyz`,
      `https://youtube.com/watch?v=${ID}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://music.youtube.com/watch?v=${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?si=abc123`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}`,
      `https://www.youtube.com/v/${ID}`,
      `youtube.com/watch?v=${ID}`,
      `youtu.be/${ID}`,
      `  https://youtu.be/${ID}  `,
    ];
    for (const c of cases) {
      expect(parseYouTubeId(c), c).toBe(ID);
    }
  });

  it('rejects invalid input', () => {
    const cases = [
      'https://vimeo.com/12345',
      `https://www.youtube.com/watch?v=tooshort12`,
      `https://www.youtube.com/watch?v=waytoolongvideoid123`,
      `https://www.youtube.com/watch?v=${ID}extra`,
      'javascript:alert(1)',
      '',
      '   ',
      'not a url at all',
      `https://www.youtube.com/watch`,
      `https://youtu.be/`,
      `ftp://youtu.be/${ID}`,
    ];
    for (const c of cases) {
      expect(parseYouTubeId(c), c).toBeNull();
    }
  });
});

describe('youtubeWatchUrl', () => {
  it('builds a watch url', () => {
    expect(youtubeWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });
});
