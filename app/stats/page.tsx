// ============================================================
// 统计页 - 学习数据可视化 + 学习曲线
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Brain, Target, Flame, Share2, Clock } from 'lucide-react';
import { useApp } from '@/lib/context';
import StatsChart from '@/components/StatsChart';
import ProgressRing from '@/components/ProgressRing';
import { getWordCounts } from '@/lib/words';
import { getRecentStats, getLearningCurve } from '@/lib/db';
import { getPastDays, calculatePhase, generateForgettingCurve, generateCheckInText } from '@/lib/utils';

export default function StatsPage() {
  const app = useApp();
  const counts = getWordCounts();
  const [recentStats, setRecentStats] = useState<any[]>([]);
  const [learningCurveData, setLearningCurveData] = useState<any[]>([]);
  const [retentionData, setRetentionData] = useState<any[] | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const stats = await getRecentStats(14);
      setRecentStats(stats);

      const curve = await getLearningCurve(30);
      setLearningCurveData(curve);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  const phase = calculatePhase(app.plan.targetDate);
  const phaseLabels = { foundation: '基础阶段', intensive: '强化阶段', sprint: '冲刺阶段' };

  const totalProgress = app.totalCount > 0
    ? Math.round((app.masteredCount / app.totalCount) * 100)
    : 0;

  const correctRate = app.todayStats?.correctRate
    ? Math.round(app.todayStats.correctRate * 100)
    : 0;

  const handleShare = () => {
    const text = generateCheckInText({
      streak: app.todayStats?.streak || 0,
      newWords: app.todayStats?.newWordsLearned || 0,
      reviewed: app.todayStats?.wordsReviewed || 0,
      totalMastered: app.masteredCount,
    });

    if (navigator.share) {
      navigator.share({ title: '考研英语打卡', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('打卡内容已复制到剪贴板！');
    }
  };

  // 生成过去14天的日期标签
  const pastDays = getPastDays(14);
  const dayLabels = pastDays.map(d => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // 最近14天学习数据（如果没有就用模拟数据）
  const newWordsData = pastDays.map(d => {
    const stat = recentStats.find(s => s.date === d);
    return stat?.newWordsLearned || 0;
  });

  const reviewedData = pastDays.map(d => {
    const stat = recentStats.find(s => s.date === d);
    return stat?.wordsReviewed || 0;
  });

  return (
    <div className="page-content pt-8 px-4">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">学习统计</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{phaseLabels[phase]}</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          title="打卡分享"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 今日概览 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="text-sm opacity-90">连续打卡</span>
          </div>
          <div className="text-3xl font-bold">{app.todayStats?.streak || 0} 天</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">正确率</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">{correctRate}%</div>
        </div>
      </div>

      {/* 掌握进度 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">掌握进度</h3>
        <div className="flex items-center gap-6">
          <ProgressRing progress={totalProgress} size={100} strokeWidth={8} color="#10b981">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{app.masteredCount}</div>
              <div className="text-[10px] text-slate-400">已掌握</div>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">高频词</span>
              <span className="text-slate-500 dark:text-slate-400">{counts.high} 词</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">中频词</span>
              <span className="text-slate-500 dark:text-slate-400">{counts.mid} 词</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">低频词</span>
              <span className="text-slate-500 dark:text-slate-400">{counts.low} 词</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-800 dark:text-white">总计</span>
                <span className="text-indigo-600 dark:text-indigo-400">{app.totalCount} 词</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 学习曲线 - 近14天学习量 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">📈 学习曲线</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">近14天每日学习量</p>
        <StatsChart
          type="bar"
          labels={dayLabels}
          datasets={[
            { label: '新学', data: newWordsData, color: '#6366f1' },
            { label: '复习', data: reviewedData, color: '#10b981' },
          ]}
          height={200}
        />
      </div>

      {/* 艾宾浩斯遗忘曲线 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">🧠 遗忘曲线</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">基于艾宾浩斯遗忘规律的理论记忆保持率</p>
        <StatsChart
          type="line"
          labels={generateForgettingCurve().map(p => `${p.hour}h`)}
          datasets={[
            { label: '记忆保持率 (%)', data: generateForgettingCurve().map(p => p.retention), color: '#f59e0b' },
          ]}
          height={180}
        />
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
          💡 <strong>提示：</strong>如果不复习，学习后24小时内会遗忘约60%。及时复习是保持记忆的关键！
        </div>
      </div>

      {/* 词汇掌握分布 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">📊 词汇状态分布</h3>
        <StatsChart
          type="doughnut"
          labels={['已掌握', '学习中', '新词']}
          datasets={[
            { label: '已掌握', data: [app.masteredCount], color: '#10b981' },
            { label: '学习中', data: [app.learningCount], color: '#6366f1' },
            { label: '新词', data: [app.newCount], color: '#94a3b8' },
          ]}
          height={200}
        />
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30 mb-4">
        <h3 className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-2">💡 学习建议</h3>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5">
          <li>• 每天坚持学习新词 + 复习旧词，效果最佳</li>
          <li>• 高频词优先掌握，它们在考试中出现概率最大</li>
          <li>• 通过词根词缀联想记忆，效率提升 3 倍</li>
          <li>• 真题例句中的生词要重点标记</li>
          <li>• 睡前复习效果比其他时段好 20%</li>
        </ul>
      </div>

      {/* 计划设置入口 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-white">学习计划</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                每日 {app.plan.dailyNewWords} 个新词
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 dark:text-slate-300">目标日期</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">{app.plan.targetDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
