// ============================================================
// 词根词缀学习页
// ============================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Puzzle } from 'lucide-react';
import { WORD_ROOTS, WORD_AFFIXES } from '@/lib/roots';
import { getWordById } from '@/lib/words';
import AudioPlayer from '@/components/AudioPlayer';

type Tab = 'roots' | 'affixes';

export default function RootsPage() {
  const [tab, setTab] = useState<Tab>('roots');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const data = tab === 'roots' ? WORD_ROOTS : WORD_AFFIXES;

  return (
    <div className="page-content pt-8 px-4">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Puzzle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">词根词缀</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">掌握词根词缀，批量记忆词汇</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('roots')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
            ${tab === 'roots'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          词根 ({WORD_ROOTS.length})
        </button>
        <button
          onClick={() => setTab('affixes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
            ${tab === 'affixes'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          词缀 ({WORD_AFFIXES.length})
        </button>
      </div>

      {/* 列表 */}
      <div className="space-y-3">
        {data.map((item) => {
          const isExpanded = expandedId === item.id;
          const relatedWords = 'exampleWords' in item
            ? (item as any).exampleWords.map((id: string) => getWordById(id)).filter(Boolean)
            : [];

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {tab === 'roots' ? (item as any).root : (item as any).affix}
                    </span>
                    {'type' in item && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        (item as any).type === 'prefix'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                      }`}>
                        {(item as any).type === 'prefix' ? '前缀' : '后缀'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.meaning}</p>
                  {'origin' in item && (item as any).origin && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      词源: {(item as any).origin}
                    </p>
                  )}
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        {item.description}
                      </p>

                      {relatedWords.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">关联词汇</h4>
                          <div className="space-y-2">
                            {relatedWords.map((w: any) => (
                              <div key={w.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                                <span className="font-medium text-sm text-slate-800 dark:text-white">{w.word}</span>
                                <AudioPlayer text={w.word} word={w.word} type="word" size="sm" />
                                <span className="text-xs text-slate-500 dark:text-slate-400">{w.meanings[0]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
