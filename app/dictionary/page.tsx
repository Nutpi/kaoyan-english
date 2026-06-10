// ============================================================
// 词库浏览页
// ============================================================

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { WORDS, searchWords, getWordsByLevel } from '@/lib/words';
import { useApp } from '@/lib/context';
import WordCard from '@/components/WordCard';
import type { WordLevel } from '@/lib/types';

export default function DictionaryPage() {
  const app = useApp();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<WordLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filteredWords = useMemo(() => {
    let result = query.trim() ? searchWords(query) : WORDS;

    if (levelFilter !== 'all') {
      result = result.filter(w => w.level === levelFilter);
    }

    // Only apply status filter on client to avoid hydration mismatch
    if (mounted && statusFilter !== 'all') {
      const learnedIds = new Set(app.progresses.keys());
      if (statusFilter === 'new') {
        result = result.filter(w => !learnedIds.has(w.id));
      } else {
        result = result.filter(w => {
          const p = app.progresses.get(w.id);
          return p?.status === statusFilter;
        });
      }
    }

    return result;
  }, [query, levelFilter, statusFilter, app.progresses, mounted]);

  const getWordStatus = (wordId: string) => {
    const p = app.progresses.get(wordId);
    return p?.status;
  };

  return (
    <div className="page-content pt-8 px-4">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">词库</h1>

      {/* 搜索栏 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索单词、释义或词根..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition-shadow"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        {/* 级别筛选 */}
        {(['all', 'high', 'mid', 'low'] as const).map(level => (
          <button
            key={level}
            onClick={() => setLevelFilter(level)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${levelFilter === level
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            {level === 'all' ? '全部' : level === 'high' ? '🔥 高频' : level === 'mid' ? '📌 中频' : '💡 低频'}
          </button>
        ))}

        <div className="w-px bg-slate-200 dark:bg-slate-600 mx-1" />

        {/* 状态筛选 */}
        {(['all', 'new', 'learning', 'mastered'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            {status === 'all' ? '全部状态' : status === 'new' ? '新词' : status === 'learning' ? '学习中' : '已掌握'}
          </button>
        ))}
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          共 {filteredWords.length} 词
        </span>
      </div>

      {/* 词汇列表 */}
      <div className="space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>没有找到匹配的词汇</p>
          </div>
        ) : (
          filteredWords.slice(0, 50).map(word => (
            <WordCard
              key={word.id}
              word={word}
              status={getWordStatus(word.id)}
            />
          ))
        )}
        {filteredWords.length > 50 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
            显示前 50 个结果，共 {filteredWords.length} 个
          </p>
        )}
      </div>
    </div>
  );
}
