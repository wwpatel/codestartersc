export type Role = 'admin' | 'student';
export type BlockType = 'note' | 'code' | 'link';
export type QuizStatus = 'ready' | 'no_captions' | 'failed';

export interface Profile {
  id: string;
  username: string;
  role: Role;
  created_at: string;
}

export interface Sector {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export interface Unit {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_id: string;
  sort_order: number;
  created_at: string;
}

export interface LessonBlock {
  id: string;
  lesson_id: string;
  type: BlockType;
  title: string | null;
  body: string | null;
  language: string | null;
  url: string | null;
  sort_order: number;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  answer_index: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  status: QuizStatus;
  questions: QuizQuestion[];
  error: string | null;
  created_at: string;
}
