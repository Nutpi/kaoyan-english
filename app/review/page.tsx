// ============================================================
// 复习页 - 待复习词汇
// ============================================================

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import FlashCard from '@/components/FlashCard';
import type { Word, Rating } from '@/lib/types';
import { getWordById } from '@/lib/words';

export default function ReviewPage() {
  const router = useRouter();
  const app = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ word: Word; rating: Rating }[]>([]);

  const reviewWords = useMemo(() => {
    return app.dueReviews
      .map(p => getWordById(p.wordId))
      .filter((w): w is Word => w !== undefined);
  }, [app.dueReviews]);

  const handleStart = () => {
    setStarted(true);
  };

  const advanceToNext = (word: Word, rating: Rating) => {
    setSessionResults(prev => [...prev, { word, rating }]);
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRate = async (rating: Rating) => {
    const currentWord = reviewWords[currentIndex];
    if (!currentWord) return;
    await app.rateWord(currentWord.id, rating);
    advanceToNext(currentWord, rating);
  };

  const handleSkip = async () => {
    const currentWord = reviewWords[currentIndex];
    if (!currentWord) return;
    await app.rateWord(currentWord.id, 4);
    advanceToNext(currentWord, 4);
  };

  // 复习完成
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
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">复习完成！</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">继续保持，记忆会越来越牢固</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sessionResults.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">复习词数</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">正确率</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{goodRatings}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">记忆牢固</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
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
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
            >
              继续复习
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
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">复习单词</h1>
        <div className="w-9" />
      </div>

      {!started ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl p-8 mb-8">
            <RotateCcw className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">待复习词汇</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
              今天有 <span className="font-bold text-emerald-600 dark:text-emerald-400">{reviewWords.length}</span> 个词需要复习
            </p>
            {reviewWords.length === 0 && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mt-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">太棒了！今日复习任务已完成</span>
              </div>
            )}
          </div>

          {reviewWords.length > 0 && (
            <div className="space-y-3 mb-8 text-left">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">待复习预览</h3>
              {reviewWords.slice(0, 8).map((w, idx) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-800 dark:text-white">{w.word}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{w.meanings[0]}</span>
                  </div>
                </div>
              ))}
              {reviewWords.length > 8 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  还有 {reviewWords.length - 8} 个词...
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={reviewWords.length === 0}
            className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            {reviewWords.length === 0 ? '暂无待复习词汇' : `开始复习 (${reviewWords.length} 词)`}
          </button>
        </motion.div>
      ) : (
        <div>
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">{currentIndex + 1} / {reviewWords.length}</span>
              <span className="text-slate-500 dark:text-slate-400">{Math.round(((currentIndex + 1) / reviewWords.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                animate={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {reviewWords[currentIndex] && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <FlashCard
                  word={reviewWords[currentIndex]}
                  onRate={handleRate}
                  onSkip={handleSkip}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
