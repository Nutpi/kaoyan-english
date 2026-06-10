// ============================================================
// 首页 - 今日学习概览
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, RotateCcw, Flame, Target, TrendingUp, Moon, Sun, Trophy, Calendar } from 'lucide-react';
import { useApp } from '@/lib/context';
import ProgressRing from '@/components/ProgressRing';
import { getWordCounts } from '@/lib/words';
import { calculatePhase } from '@/lib/utils';

export default function HomePage() {
  const app = useApp();
  const counts = getWordCounts();

  if (!app.initialized) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  const phase = calculatePhase(app.plan.targetDate);
  const phaseLabels = { foundation: '基础阶段', intensive: '强化阶段', sprint: '冲刺阶段' };
  const phaseColors = { foundation: 'bg-blue-500', intensive: 'bg-amber-500', sprint: 'bg-red-500' };

  const totalProgress = app.totalCount > 0
    ? Math.round(((app.masteredCount + app.learningCount) / app.totalCount) * 100)
    : 0;

  const todayNew = app.todayStats?.newWordsLearned || 0;
  const todayReviewed = app.todayStats?.wordsReviewed || 0;
  const streak = app.todayStats?.streak || 0;

  return (
    <div className="page-content">
      {/* 顶部 Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">考研英语词库</h1>
            <p className="text-indigo-200 text-sm mt-1">每天进步一点点 📚</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${phaseColors[phase]} px-3 py-1 rounded-full text-xs font-medium text-white`}>
              {phaseLabels[phase]}
            </span>
            <button
              onClick={app.toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {app.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 今日统计 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold animate-count">{todayNew}</div>
            <div className="text-indigo-200 text-xs mt-1">今日新学</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold animate-count">{todayReviewed}</div>
            <div className="text-indigo-200 text-xs mt-1">今日复习</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-orange-300 animate-flame" />
              <span className="text-3xl font-bold animate-count">{streak}</span>
            </div>
            <div className="text-indigo-200 text-xs mt-1">连续天数</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/learn">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-white text-sm">学习新词</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{app.newCount} 词待学</div>
              </div>
            </motion.div>
          </Link>

          <Link href="/review">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <RotateCcw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-white text-sm">复习单词</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{app.dueReviews.length} 词待复习</div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* 总体进度 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              学习进度
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {app.masteredCount + app.learningCount} / {app.totalCount} 词
            </span>
          </div>

          <div className="flex items-center gap-6">
            <ProgressRing progress={totalProgress} size={90} strokeWidth={6}>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalProgress}%</div>
              </div>
            </ProgressRing>

            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">高频词 ({counts.high})</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all duration-700" style={{ width: `${counts.high > 0 ? Math.round((Array.from(app.progresses.values()).filter(p => p.status === 'mastered').length / counts.high) * 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">中频词 ({counts.mid})</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${counts.mid > 0 ? Math.round((Array.from(app.progresses.values()).filter(p => ['learning', 'review', 'mastered'].includes(p.status)).length / counts.mid) * 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">低频词 ({counts.low})</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${counts.low > 0 ? Math.round((Array.from(app.progresses.values()).filter(p => p.status !== 'new').length / counts.low) * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 学习统计概览 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700 text-center">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{app.masteredCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">已掌握</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700 text-center">
            <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{app.learningCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">学习中</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700 text-center">
            <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{counts.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">总词数</div>
          </div>
        </div>

        {/* 学习计划提示 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">📅 学习计划</h4>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                每日 {app.plan.dailyNewWords} 个新词 · 目标 {app.plan.targetDate}
              </p>
            </div>
            <Link href="/stats" className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline">
              查看详情 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
