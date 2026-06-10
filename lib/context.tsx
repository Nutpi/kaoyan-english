// ============================================================
// 全局状态管理 - React Context
// ============================================================

'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { WordProgress, DailyStats, StudyPlan, Word } from './types';
import { WORDS } from './words';
import * as db from './db';
import { updateProgress, createInitialProgress, getDueReviews } from './sm2';

// ========== State ==========
interface AppState {
  /** 所有学习进度 */
  progresses: Map<string, WordProgress>;
  /** 每日统计 */
  todayStats: DailyStats | null;
  /** 学习计划 */
  plan: StudyPlan;
  /** 是否已初始化 */
  initialized: boolean;
  /** 暗色模式 */
  darkMode: boolean;
}

const defaultPlan: StudyPlan = {
  dailyNewWords: 20,
  targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  startDate: new Date().toISOString().split('T')[0],
  phase: 'foundation',
};

const initialState: AppState = {
  progresses: new Map(),
  todayStats: null,
  plan: defaultPlan,
  initialized: false,
  darkMode: false,
};

// ========== Actions ==========
type Action =
  | { type: 'INIT'; payload: { progresses: WordProgress[]; stats: DailyStats; plan: StudyPlan } }
  | { type: 'SET_PROGRESS'; payload: WordProgress }
  | { type: 'SET_TODAY_STATS'; payload: DailyStats }
  | { type: 'SET_PLAN'; payload: StudyPlan }
  | { type: 'TOGGLE_DARK_MODE' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT': {
      const map = new Map<string, WordProgress>();
      action.payload.progresses.forEach(p => map.set(p.wordId, p));
      return {
        ...state,
        progresses: map,
        todayStats: action.payload.stats,
        plan: action.payload.plan,
        initialized: true,
      };
    }
    case 'SET_PROGRESS': {
      const newMap = new Map(state.progresses);
      newMap.set(action.payload.wordId, action.payload);
      return { ...state, progresses: newMap };
    }
    case 'SET_TODAY_STATS':
      return { ...state, todayStats: action.payload };
    case 'SET_PLAN':
      return { ...state, plan: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
}

// ========== Context ==========
interface AppContextValue extends AppState {
  // 计算属性
  dueReviews: WordProgress[];
  newWordsAvailable: Word[];
  masteredCount: number;
  learningCount: number;
  newCount: number;
  totalCount: number;

  // 操作
  rateWord: (wordId: string, rating: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  startNewWords: (count: number) => Promise<Word[]>;
  updateTodayStats: (updates: Partial<DailyStats>) => Promise<void>;
  savePlan: (plan: StudyPlan) => Promise<void>;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 初始化
  useEffect(() => {
    init();
  }, []);

  // 暗色模式
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  async function init() {
    try {
      const [progresses, stats, plan] = await Promise.all([
        db.getAllProgress(),
        db.getOrCreateTodayStats(),
        db.getStudyPlan(),
      ]);

      dispatch({
        type: 'INIT',
        payload: {
          progresses,
          stats,
          plan: plan || defaultPlan,
        },
      });
    } catch (err) {
      console.error('Failed to initialize:', err);
      // 使用默认数据初始化
      const stats = await db.getOrCreateTodayStats();
      dispatch({
        type: 'INIT',
        payload: {
          progresses: [],
          stats,
          plan: defaultPlan,
        },
      });
    }
  }

  // 计算属性
  const dueReviews = getDueReviews(Array.from(state.progresses.values()));
  const learnedIds = new Set(state.progresses.keys());
  const newWordsAvailable = WORDS.filter(w => !learnedIds.has(w.id) && w.level === 'high')
    .concat(WORDS.filter(w => !learnedIds.has(w.id) && w.level === 'mid'))
    .concat(WORDS.filter(w => !learnedIds.has(w.id) && w.level === 'low'));

  const masteredCount = Array.from(state.progresses.values()).filter(p => p.status === 'mastered').length;
  const learningCount = Array.from(state.progresses.values()).filter(p => p.status === 'learning' || p.status === 'review').length;
  const newCount = WORDS.length - state.progresses.size;
  const totalCount = WORDS.length;

  // 评分单词
  const rateWord = useCallback(async (wordId: string, rating: 0 | 1 | 2 | 3 | 4 | 5) => {
    const isNewWord = !state.progresses.get(wordId);
    let current = state.progresses.get(wordId);
    if (!current) {
      current = createInitialProgress(wordId);
    }

    const updated = updateProgress(current, rating as any, state.plan.phase);
    await db.saveProgress(updated);
    dispatch({ type: 'SET_PROGRESS', payload: updated });

    // 更新今日统计
    if (state.todayStats) {
      const newStats = {
        ...state.todayStats,
        wordsReviewed: state.todayStats.wordsReviewed + 1,
        newWordsLearned: isNewWord
          ? state.todayStats.newWordsLearned + 1
          : state.todayStats.newWordsLearned,
        correctRate: rating >= 3
          ? (state.todayStats.correctRate * state.todayStats.wordsReviewed + 1) / (state.todayStats.wordsReviewed + 1)
          : (state.todayStats.correctRate * state.todayStats.wordsReviewed) / (state.todayStats.wordsReviewed + 1),
      };
      await db.saveDailyStats(newStats);
      dispatch({ type: 'SET_TODAY_STATS', payload: newStats });
    }

    // 更新学习曲线
    const today = db.getTodayStr();
    const mastered = Array.from(state.progresses.values()).filter(p => p.status === 'mastered').length;
    await db.saveLearningCurvePoint({
      date: today,
      newWords: state.todayStats?.newWordsLearned || 0,
      reviewedWords: (state.todayStats?.wordsReviewed || 0) + 1,
      accuracy: state.todayStats?.correctRate || 0,
      totalMastered: mastered,
    });
  }, [state.progresses, state.todayStats, state.plan.phase]);

  // 开始学习新词（仅返回单词列表，不预创建进度，不更新统计）
  const startNewWords = useCallback(async (count: number): Promise<Word[]> => {
    const words = newWordsAvailable.slice(0, count);
    return words;
  }, [newWordsAvailable]);

  // 更新今日统计
  const updateTodayStats = useCallback(async (updates: Partial<DailyStats>) => {
    if (state.todayStats) {
      const newStats = { ...state.todayStats, ...updates };
      await db.saveDailyStats(newStats);
      dispatch({ type: 'SET_TODAY_STATS', payload: newStats });
    }
  }, [state.todayStats]);

  // 保存计划
  const savePlan = useCallback(async (plan: StudyPlan) => {
    await db.saveStudyPlan(plan);
    dispatch({ type: 'SET_PLAN', payload: plan });
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  const refreshData = useCallback(async () => {
    await init();
  }, []);

  const value: AppContextValue = {
    ...state,
    dueReviews,
    newWordsAvailable,
    masteredCount,
    learningCount,
    newCount,
    totalCount,
    rateWord,
    startNewWords,
    updateTodayStats,
    savePlan,
    toggleDarkMode,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
