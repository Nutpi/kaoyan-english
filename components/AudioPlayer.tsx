// ============================================================
// 音频播放器组件 - 支持预生成文件 + Web Speech API 降级
// ============================================================

'use client';

import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getAudioPath } from '@/lib/utils';

interface AudioPlayerProps {
  text: string;
  word: string;
  type?: 'word' | 'example';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AudioPlayer({
  text,
  word,
  type = 'word',
  className = '',
  size = 'md',
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const play = useCallback(async () => {
    if (playing) return;

    try {
      setPlaying(true);

      // 1. 尝试预生成的音频文件
      const audioPath = getAudioPath(word, type);
      const audio = new Audio(audioPath);

      await new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => reject(new Error('Audio file not found'));
        audio.load();
      });

      audio.onended = () => { setPlaying(false); };
      await audio.play();
      return;
    } catch {
      // 2. 降级到 Web Speech API
      try {
        if ('speechSynthesis' in window) {
          // 停止之前的语音
          speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = type === 'word' ? 0.75 : 0.85;
          utterance.pitch = 1;

          utterance.onend = () => setPlaying(false);
          utterance.onerror = () => setPlaying(false);

          speechSynthesis.speak(utterance);
        }
      } catch {
        setPlaying(false);
      }
    }
  }, [playing, text, word, type]);

  return (
    <button
      onClick={play}
      className={`rounded-full transition-all hover:scale-110 active:scale-95
        ${playing
          ? 'bg-indigo-200 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 animate-pulse'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
        }
        ${sizeClasses[size]} ${className}`}
      title={playing ? '播放中...' : `播放${type === 'word' ? '单词' : '例句'}发音`}
    >
      {playing ? <VolumeX className={iconSizes[size]} /> : <Volume2 className={iconSizes[size]} />}
    </button>
  );
}
