// ============================================================
// 工具函数
// ============================================================

/** 格式化日期为中文友好格式 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 格式化时间为 mm:ss */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
}

/** 计算两个日期之间的天数 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/** 获取过去N天的日期列表 */
export function getPastDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

/** 根据目标日期计算推荐每日新词量 */
export function calculateRecommendedDailyWords(
  totalWords: number,
  targetDate: string,
  learnedWords: number
): number {
  const today = new Date();
  const target = new Date(targetDate);
  const daysLeft = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const remaining = totalWords - learnedWords;
  return Math.max(5, Math.min(100, Math.ceil(remaining / daysLeft)));
}

/** 计算学习阶段 */
export function calculatePhase(targetDate: string): 'foundation' | 'intensive' | 'sprint' {
  const today = new Date();
  const target = new Date(targetDate);
  const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 30) return 'sprint';
  if (daysLeft <= 90) return 'intensive';
  return 'foundation';
}

/** 获取音频文件路径 */
export function getAudioPath(word: string, type: 'word' | 'example'): string {
  const safeName = word.toLowerCase().replace(/[^a-z]/g, '');
  return `/audio/${type === 'word' ? 'words' : 'examples'}/${safeName}.wav`;
}

/** 防抖函数 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/** 深色模式 Hook 辅助 */
export function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** 生成打卡卡片文本 */
export function generateCheckInText(stats: {
  streak: number;
  newWords: number;
  reviewed: number;
  totalMastered: number;
}): string {
  return `🎯 考研英语打卡 Day ${stats.streak}\n📚 今日新学 ${stats.newWords} 词\n🔄 复习 ${stats.reviewed} 词\n✅ 已掌握 ${stats.totalMastered} 词\n💪 坚持就是胜利！#考研英语 #每日打卡`;
}

/** 计算记忆保持率曲线数据（艾宾浩斯遗忘曲线模型） */
export function generateForgettingCurve(hoursStudied: number = 1): { hour: number; retention: number }[] {
  const points = [];
  for (let h = 0; h <= 72; h += 2) {
    // 艾宾浩斯遗忘公式: R = e^(-t/S), S ≈ 24 (假设学习后记忆强度)
    const retention = Math.exp(-h / 24) * 100;
    points.push({ hour: h, retention: Math.max(0, Math.round(retention * 10) / 10) });
  }
  return points;
}
