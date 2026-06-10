// ============================================================
// 考研英语词库 - 核心类型定义
// ============================================================

/** 词汇频率等级 */
export type WordLevel = 'high' | 'mid' | 'low';

/** 单词数据结构 */
export interface Word {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meanings: string[];
  englishDef: string;
  example: string;
  exampleTranslation: string;
  exampleSource: string;
  level: WordLevel;
  root?: string;
  affix?: string;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
}

/** 用户对单词的记忆评级 (SM-2 算法) */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

/** 单词学习状态 */
export type WordStatus = 'new' | 'learning' | 'review' | 'mastered';

/** 用户学习记录 (SM-2 算法所需数据) */
export interface WordProgress {
  wordId: string;
  status: WordStatus;
  /** SM-2: 简易因子 (≥1.3) */
  easeFactor: number;
  /** SM-2: 重复次数 */
  repetition: number;
  /** 下次复习日期 (ISO string) */
  nextReview: string;
  /** 上次复习日期 (ISO string) */
  lastReview?: string;
  /** 历史评分记录 */
  history: { date: string; rating: Rating }[];
  /** 累计复习次数 */
  totalReviews: number;
  /** 累计正确次数 */
  correctCount: number;
}

/** 每日学习统计 */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  newWordsLearned: number;
  wordsReviewed: number;
  correctRate: number;
  totalTimeSpent: number; // 秒
  streak: number;
}

/** 学习计划 */
export interface StudyPlan {
  dailyNewWords: number;
  targetDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  /** 当前阶段: 基础→强化→冲刺 */
  phase: 'foundation' | 'intensive' | 'sprint';
}

/** 词根数据 */
export interface WordRoot {
  id: string;
  root: string;
  meaning: string;
  origin?: string;
  exampleWords: string[]; // 关联的单词ID列表
  description: string;
}

/** 词缀数据 */
export interface WordAffix {
  id: string;
  affix: string;
  type: 'prefix' | 'suffix';
  meaning: string;
  exampleWords: string[];
  description: string;
}

/** 学习曲线数据点 */
export interface LearningCurvePoint {
  date: string;
  newWords: number;
  reviewedWords: number;
  accuracy: number;
  totalMastered: number;
}

/** 应用全局状态 */
export interface AppState {
  plan: StudyPlan;
  stats: DailyStats[];
  todayStats: DailyStats;
  totalMastered: number;
  totalLearning: number;
  totalNew: number;
  currentStreak: number;
}
