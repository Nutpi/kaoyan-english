// ============================================================
// 学习页 - 新词学习闪卡
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import FlashCard from '@/components/FlashCard';
import type { Word, Rating } from '@/lib/types';
import { getWordById } from '@/lib/words';

export default function LearnPage() {
  const router = useRouter();
  const app = useApp();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ word: Word; rating: Rating }[]>([]);

  const handleStart = async () => {
    const count = app.plan.dailyNewWords;
    const newWords = await app.startNewWords(Math.min(count, 20));
    setWords(newWords);
    setStarted(true);
  };

  const advanceToNext = (word: Word, rating: Rating) => {
    setSessionResults(prev => [...prev, { word, rating }]);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRate = async (rating: Rating) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    await app.rateWord(currentWord.id, rating);
    advanceToNext(currentWord, rating);
  };

  const handleSkip = async () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    // 认识跳过按评分 4（熟练掌握）处理
    await app.rateWord(currentWord.id, 4);
    advanceToNext(currentWord, 4);
  };

  // 学习完成
  if (completed) {
    const goodRatings = sessionResults.filter(r => r.rating >= 3).length;
    const accuracy = sessionResults.length > 0 ? Math.round((goodRatings / sessionResults.length) * 100) : 0;

    return (
      <div className="page-content px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">学习完成！</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">你已完成本组词汇的学习</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sessionResults.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">学习词数</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">掌握率</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{goodRatings}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">已掌握</div>
            </div>
          </div>

          {/* 词汇回顾 */}
          <div className="space-y-2 mb-8 text-left">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">词汇回顾</h3>
            {sessionResults.map((result, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700"
              >
                <div>
                  <span className="font-medium text-slate-800 dark:text-white">{result.word.word}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{result.word.meanings[0]}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  result.rating >= 3
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {result.rating >= 3 ? '掌握' : '需复习'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => {
                setStarted(false);
                setCompleted(false);
                setCurrentIndex(0);
                setSessionResults([]);
              }}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              继续学习
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-content px-4 pt-8">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">学习新词</h1>
        <div className="w-9" />
      </div>

      {!started ? (
        /* 开始学习界面 */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-3xl p-8 mb-8">
            <BookOpen className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">准备学习新词</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              还有 <span className="font-bold text-indigo-600 dark:text-indigo-400">{app.newCount}</span> 个新词待学习
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">1</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">点击卡片翻转查看释义和例句</span>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">2</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">根据自己的记忆程度评分</span>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">3</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">系统会自动安排复习时间</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={app.newWordsAvailable.length === 0}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {app.newWordsAvailable.length === 0 ? '暂无新词' : `开始学习 (${Math.min(app.plan.dailyNewWords, 20)} 词)`}
          </button>
        </motion.div>
      ) : (
        /* 学习中 */
        <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
          {/* 进度条 */}
          <div className="mb-3 shrink-0">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">{currentIndex + 1} / {words.length}</span>
              <span className="text-slate-500 dark:text-slate-400">{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 闪卡 - flex-1 fills remaining space */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {words[currentIndex] && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <FlashCard
                  word={words[currentIndex]}
                  onRate={handleRate}
                  onSkip={handleSkip}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
