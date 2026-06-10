// ============================================================
// 学习统计图表组件
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface StatsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fillColor?: string;
  }[];
  height?: number;
}

export default function StatsChart({ type, labels, datasets, height = 200 }: StatsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 销毁旧图表
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';

    const config: any = {
      type,
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          backgroundColor: type === 'doughnut'
            ? datasets.map(d => d.color)
            : ds.fillColor || ds.color + '20',
          fill: type === 'line',
          tension: 0.4,
          pointRadius: type === 'line' ? 3 : undefined,
          pointHoverRadius: type === 'line' ? 6 : undefined,
          borderWidth: type === 'doughnut' ? 0 : 2,
          borderRadius: type === 'bar' ? 6 : undefined,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut' || datasets.length > 1,
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#e2e8f0' : '#1e293b',
            bodyColor: isDark ? '#94a3b8' : '#64748b',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: type === 'doughnut' ? {} : {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 10 },
              maxRotation: 0,
            },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10 },
            },
            beginAtZero: true,
          },
        },
        ...(type === 'doughnut' ? { cutout: '65%' } : {}),
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, labels, datasets, height]);

  return (
    <div style={{ height }} className="w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
