// ============================================================
// IndexedDB 数据库层
// 使用 idb 库进行类型安全的数据库操作
// ============================================================

import { openDB, type IDBPDatabase } from 'idb';
import type { WordProgress, DailyStats, StudyPlan } from './types';

const DB_NAME = 'kaoyan-english-db';
const DB_VERSION = 1;

interface KaoyanDB {
  // 单词学习进度
  progress: {
    key: string; // wordId
    value: WordProgress;
    indexes: { 'by-status': string; 'by-next-review': string };
  };
  // 每日统计
  dailyStats: {
    key: string; // YYYY-MM-DD
    value: DailyStats;
  };
  // 学习计划
  studyPlan: {
    key: string;
    value: StudyPlan;
  };
  // 学习曲线历史
  learningCurve: {
    key: string;
    value: {
      date: string;
      newWords: number;
      reviewedWords: number;
      accuracy: number;
      totalMastered: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<KaoyanDB>> | null = null;

function getDB(): Promise<IDBPDatabase<KaoyanDB>> {
  if (!dbPromise) {
    dbPromise = openDB<KaoyanDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 单词进度存储
        const progressStore = db.createObjectStore('progress', { keyPath: 'wordId' });
        progressStore.createIndex('by-status', 'status');
        progressStore.createIndex('by-next-review', 'nextReview');

        // 每日统计存储
        db.createObjectStore('dailyStats', { keyPath: 'date' });

        // 学习计划存储
        db.createObjectStore('studyPlan', { keyPath: 'id' });

        // 学习曲线存储
        db.createObjectStore('learningCurve', { keyPath: 'date' });
      },
    });
  }
  return dbPromise;
}

// ========== 进度操作 ==========

export async function getProgress(wordId: string): Promise<WordProgress | undefined> {
  const db = await getDB();
  return db.get('progress', wordId);
}

export async function getAllProgress(): Promise<WordProgress[]> {
  const db = await getDB();
  return db.getAll('progress');
}

export async function saveProgress(progress: WordProgress): Promise<void> {
  const db = await getDB();
  await db.put('progress', progress);
}

export async function saveProgressBatch(progresses: WordProgress[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('progress', 'readwrite');
  for (const p of progresses) {
    await tx.store.put(p);
  }
  await tx.done;
}

export async function getProgressByStatus(status: string): Promise<WordProgress[]> {
  const db = await getDB();
  return db.getAllFromIndex('progress', 'by-status', status);
}

export async function getProgressCount(): Promise<number> {
  const db = await getDB();
  return db.count('progress');
}

// ========== 每日统计操作 ==========

export async function getDailyStats(date: string): Promise<DailyStats | undefined> {
  const db = await getDB();
  return db.get('dailyStats', date);
}

export async function saveDailyStats(stats: DailyStats): Promise<void> {
  const db = await getDB();
  await db.put('dailyStats', stats);
}

export async function getAllDailyStats(): Promise<DailyStats[]> {
  const db = await getDB();
  return db.getAll('dailyStats');
}

export async function getRecentStats(days: number): Promise<DailyStats[]> {
  const db = await getDB();
  const allStats = await db.getAll('dailyStats');
  return allStats
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ========== 学习计划操作 ==========

const PLAN_ID = 'default';

export async function getStudyPlan(): Promise<StudyPlan | undefined> {
  const db = await getDB();
  const plan = await db.get('studyPlan', PLAN_ID);
  return plan ? { ...plan } : undefined;
}

export async function saveStudyPlan(plan: StudyPlan): Promise<void> {
  const db = await getDB();
  await db.put('studyPlan', { ...plan, id: PLAN_ID } as any);
}

// ========== 学习曲线操作 ==========

export async function getLearningCurve(days: number = 30): Promise<any[]> {
  const db = await getDB();
  const all = await db.getAll('learningCurve');
  return all
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveLearningCurvePoint(point: any): Promise<void> {
  const db = await getDB();
  await db.put('learningCurve', point);
}

// ========== 便捷方法 ==========

/** 获取今日日期字符串 YYYY-MM-DD */
export function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** 获取或创建今日统计 */
export async function getOrCreateTodayStats(): Promise<DailyStats> {
  const today = getTodayStr();
  let stats = await getDailyStats(today);
  if (!stats) {
    // 计算连续天数
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yesterdayStats = await getDailyStats(yesterdayStr);
    const streak = yesterdayStats ? yesterdayStats.streak + 1 : 1;

    stats = {
      date: today,
      newWordsLearned: 0,
      wordsReviewed: 0,
      correctRate: 0,
      totalTimeSpent: 0,
      streak,
    };
    await saveDailyStats(stats);
  }
  return stats;
}
