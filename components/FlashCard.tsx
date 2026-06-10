// ============================================================
// 单词闪卡组件 - 支持 3D 翻转动画和认识跳过
// ============================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Eye, RotateCcw, Zap } from 'lucide-react';
import type { Word, Rating } from '@/lib/types';
import { getAudioPath } from '@/lib/utils';

interface FlashCardProps {
  word: Word;
  onRate: (rating: Rating) => void;
  onSkip?: () => void;
  showActions?: boolean;
}

const ratingLabels: Record<Rating, { label: string; color: string; desc: string }> = {
  0: { label: '完全忘记', color: 'bg-red-500 hover:bg-red-600', desc: '毫无印象' },
  1: { label: '有印象', color: 'bg-orange-500 hover:bg-orange-600', desc: '想不起来' },
  2: { label: '想起来了', color: 'bg-amber-500 hover:bg-amber-600', desc: '有些费劲' },
  3: { label: '基本掌握', color: 'bg-lime-500 hover:bg-lime-600', desc: '不太熟练' },
  4: { label: '熟练掌握', color: 'bg-emerald-500 hover:bg-emerald-600', desc: '阅读中能认出' },
  5: { label: '完美记忆', color: 'bg-teal-500 hover:bg-teal-600', desc: '写作中能运用' },
};

export default function FlashCard({ word, onRate, onSkip, showActions = true }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);

  const playAudio = async (type: 'word' | 'example') => {
    try {
      setPlaying(true);
      const audioPath = getAudioPath(word.word, type);

      // 先尝试预生成的音频文件
      try {
        const audio = new Audio(audioPath);
        await audio.play();
        audio.onended = () => setPlaying(false);
        return;
      } catch {
        // 预生成音频不存在，降级到 Web Speech API
      }

      // Web Speech API 降级方案
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          type === 'word' ? word.word : word.example
        );
        utterance.lang = 'en-US';
        utterance.rate = type === 'word' ? 0.8 : 0.9;
        utterance.onend = () => setPlaying(false);
        utterance.onerror = () => setPlaying(false);
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Audio playback failed:', err);
    } finally {
      setTimeout(() => setPlaying(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 3D 翻转卡片容器 */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ===== 正面 ===== */}
          <div
            className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center border border-indigo-100 dark:border-slate-600"
            style={{ backfaceVisibility: 'hidden', minHeight: '240px' }}
          >
            {/* 频率标签 */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${word.level === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  word.level === 'mid' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {word.level === 'high' ? '高频' : word.level === 'mid' ? '中频' : '低频'}
              </span>
            </div>

            {/* 词根标签 */}
            {word.root && (
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  词根: {word.root}
                </span>
              </div>
            )}

            {/* 单词 */}
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
              {word.word}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">
              {word.phonetic}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {word.partOfSpeech}
            </p>

            {/* 播放发音按钮 */}
            <button
              onClick={(e) => { e.stopPropagation(); playAudio('word'); }}
              className={`mt-6 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all hover:scale-110 ${playing ? 'animate-pulse' : ''}`}
            >
              <Volume2 className="w-6 h-6" />
            </button>

            {/* 正面底部按钮区 */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
              {/* 认识跳过按钮 */}
              {showActions && onSkip && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSkip(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  认识，跳过
                </button>
              )}
              {!showActions && <div />}

              {/* 翻转提示 */}
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" /> 点击翻转
              </p>
            </div>
          </div>

          {/* ===== 背面 ===== */}
          <div
            className="absolute inset-0 w-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl flex flex-col border border-emerald-100 dark:border-slate-600 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '240px',
            }}
          >
            {/* 紧凑内容区 */}
            <div className="flex-1 p-5 pb-1 flex flex-col justify-between">
              {/* 上半区：释义 */}
              <div className="space-y-2">
                {/* 中文释义 + 英文释义 合并行 */}
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">
                    {word.meanings.join('；')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{word.englishDef}</p>
                </div>

                {/* 例句 */}
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">真题例句</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); playAudio('example'); }}
                      className="p-1 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">{word.example}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{word.exampleTranslation}</p>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">📍 {word.exampleSource}</p>
                </div>
              </div>

              {/* 下半区：近义词 + 搭配 */}
              {(word.synonyms?.length || word.collocations?.length) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {word.synonyms?.map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                      同: {s}
                    </span>
                  ))}
                  {word.collocations?.slice(0, 3).map(c => (
                    <span key={c} className="px-1.5 py-0.5 rounded-full text-[11px] bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 翻转提示 */}
            <p className="shrink-0 py-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center">
              <RotateCcw className="w-3 h-3" /> 点击翻回正面
            </p>
          </div>
        </div>
      </div>

      {/* 评分按钮 */}
      <AnimatePresence>
        {showActions && flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6 grid grid-cols-3 gap-2"
          >
            {([0, 1, 2, 3, 4, 5] as Rating[]).map((r) => (
              <button
                key={r}
                onClick={(e) => { e.stopPropagation(); onRate(r); }}
                className={`${ratingLabels[r].color} text-white rounded-xl py-3 px-2 text-center transition-all hover:scale-105 active:scale-95 shadow-sm`}
              >
                <div className="text-sm font-semibold">{ratingLabels[r].label}</div>
                <div className="text-[10px] opacity-80">{ratingLabels[r].desc}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
