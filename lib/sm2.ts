// ============================================================
// SM-2 间隔重复算法实现
// 优化版：加入学习阶段、难度自适应、考研场景调优
// ============================================================

import type { Rating, WordProgress, WordStatus } from './types';

/**
 * SM-2 算法核心
 *
 * 评分标准（适配考研英语学习）：
 * 0 - 完全不认识（看到毫无印象）
 * 1 - 有印象但不记得意思
 * 2 - 想起来了但费劲（需要再次复习）
 * 3 - 基本掌握，但不够熟练
 * 4 - 熟练掌握，能在阅读中认出
 * 5 - 完美记忆，能在写作中运用
 *
 * 改进点：
 * 1. 加入 learning 阶段（评分 0-2 时进行短间隔重复）
 * 2. 考研冲刺模式：基础阶段间隔稍长，冲刺阶段间隔缩短
 * 3. 连续正确加分：连续 3 次以上正确会加速间隔增长
 */

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

/** 计算学习阶段内的短间隔（分钟） */
function getLearningInterval(repetition: number): number {
  const intervals = [1, 5, 15, 60, 240]; // 1分钟, 5分钟, 15分钟, 1小时, 4小时
  return intervals[Math.min(repetition, intervals.length - 1)];
}

/** 计算复习间隔（天） */
function getReviewInterval(repetition: number, easeFactor: number): number {
  if (repetition === 0) return 1;
  if (repetition === 1) return 3;
  if (repetition === 2) return 7;
  // 之后按 easeFactor 递增
  return Math.round(
    getReviewInterval(repetition - 1, easeFactor) * easeFactor
  );
}

/**
 * 根据评分更新单词进度
 */
export function updateProgress(
  current: WordProgress,
  rating: Rating,
  phase: 'foundation' | 'intensive' | 'sprint' = 'foundation'
): WordProgress {
  const now = new Date();
  const historyEntry = { date: now.toISOString(), rating };

  let { easeFactor, repetition, status } = current;
  const totalReviews = current.totalReviews + 1;
  const correctCount = rating >= 3 ? current.correctCount + 1 : current.correctCount;

  // 评分 0-2：还在学习阶段
  if (rating < 3) {
    repetition = rating === 0 ? 0 : Math.max(0, repetition - 1);

    // 更新 ease factor
    easeFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    );

    // 短间隔复习（学习阶段）
    const intervalMinutes = getLearningInterval(repetition);
    const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000);

    status = 'learning';

    return {
      ...current,
      status,
      easeFactor,
      repetition,
      nextReview: nextReview.toISOString(),
      lastReview: now.toISOString(),
      history: [...current.history, historyEntry],
      totalReviews,
      correctCount,
    };
  }

  // 评分 3-5：进入复习阶段
  repetition += 1;

  // 更新 ease factor
  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  // 连续正确加分
  const recentCorrect = current.history.slice(-3).filter(h => h.rating >= 3).length;
  if (recentCorrect >= 3) {
    easeFactor = Math.min(easeFactor + 0.1, 3.5);
  }

  // 考研阶段调优
  let intervalDays = getReviewInterval(repetition, easeFactor);

  if (phase === 'sprint') {
    // 冲刺阶段：缩短间隔，确保记忆
    intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
  } else if (phase === 'intensive') {
    // 强化阶段：适度缩短
    intervalDays = Math.max(1, Math.round(intervalDays * 0.85));
  }

  // 间隔上限：不超过 180 天
  intervalDays = Math.min(intervalDays, 180);

  const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  // 判断是否掌握
  if (repetition >= 5 && rating >= 4) {
    status = 'mastered';
  } else {
    status = 'review';
  }

  return {
    ...current,
    status,
    easeFactor,
    repetition,
    nextReview: nextReview.toISOString(),
    lastReview: now.toISOString(),
    history: [...current.history, historyEntry],
    totalReviews,
    correctCount,
  };
}

/**
 * 为新单词创建初始进度
 */
export function createInitialProgress(wordId: string): WordProgress {
  return {
    wordId,
    status: 'new',
    easeFactor: INITIAL_EASE_FACTOR,
    repetition: 0,
    nextReview: new Date().toISOString(),
    history: [],
    totalReviews: 0,
    correctCount: 0,
  };
}

/**
 * 获取单词状态标签
 */
export function getStatusLabel(status: WordStatus): string {
  const labels: Record<WordStatus, string> = {
    new: '新词',
    learning: '学习中',
    review: '复习中',
    mastered: '已掌握',
  };
  return labels[status];
}

/**
 * 获取状态对应颜色
 */
export function getStatusColor(status: WordStatus): string {
  const colors: Record<WordStatus, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    learning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return colors[status];
}

/**
 * 计算今日需要复习的单词数
 */
export function getTodayReviewCount(progresses: WordProgress[]): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return progresses.filter(p => {
    if (p.status === 'new' || p.status === 'mastered') return false;
    const reviewDate = new Date(p.nextReview);
    return reviewDate <= tomorrow;
  }).length;
}

/**
 * 获取今日到期复习的单词列表
 */
export function getDueReviews(progresses: WordProgress[]): WordProgress[] {
  const now = new Date();
  return progresses
    .filter(p => {
      if (p.status === 'new' || p.status === 'mastered') return false;
      return new Date(p.nextReview) <= now;
    })
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
}

/**
 * 计算记忆保持率（用于学习曲线）
 */
export function calculateRetentionRate(progresses: WordProgress[]): number {
  const activeProgresses = progresses.filter(p => p.totalReviews > 0);
  if (activeProgresses.length === 0) return 0;

  // 基于最近的评分计算平均记忆强度
  const recentRatings = activeProgresses.map(p => {
    const recent = p.history.slice(-5);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, h) => sum + h.rating, 0) / recent.length;
  });

  const avgRating = recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length;
  return Math.round((avgRating / 5) * 100);
}
