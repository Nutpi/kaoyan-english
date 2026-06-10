// ============================================================
// 单词卡片组件（词库浏览用）
// ============================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Word } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/sm2';
import AudioPlayer from './AudioPlayer';

interface WordCardProps {
  word: Word;
  status?: 'new' | 'learning' | 'review' | 'mastered';
  compact?: boolean;
}

export default function WordCard({ word, status, compact = false }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 cursor-pointer"
        onClick={() => !compact && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800 dark:text-white">{word.word}</span>
                <AudioPlayer text={word.word} word={word.word} type="word" size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-500 dark:text-slate-400">{word.phonetic}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{word.partOfSpeech}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
              ${word.level === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                word.level === 'mid' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {word.level === 'high' ? '高频' : word.level === 'mid' ? '中频' : '低频'}
            </span>
            {!compact && (
              expanded
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {word.meanings.join('；')}
        </p>
      </div>

      <AnimatePresence>
        {expanded && !compact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
              {/* 英文释义 */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">English</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{word.englishDef}</p>
              </div>

              {/* 例句 */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500">真题例句</h4>
                  <AudioPlayer text={word.example} word={word.word} type="example" size="sm" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">{word.example}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{word.exampleTranslation}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">📍 {word.exampleSource}</p>
              </div>

              {/* 词根词缀 */}
              {(word.root || word.affix) && (
                <div className="flex gap-2">
                  {word.root && (
                    <span className="px-2 py-1 rounded-lg text-xs bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                      词根: {word.root}
                    </span>
                  )}
                  {word.affix && (
                    <span className="px-2 py-1 rounded-lg text-xs bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
                      词缀: {word.affix}
                    </span>
                  )}
                </div>
              )}

              {/* 同义词 / 反义词 / 搭配 */}
              <div className="flex flex-wrap gap-1">
                {word.synonyms?.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                    同: {s}
                  </span>
                ))}
                {word.antonyms?.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                    反: {a}
                  </span>
                ))}
                {word.collocations?.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
