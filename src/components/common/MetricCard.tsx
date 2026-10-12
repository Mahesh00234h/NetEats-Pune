// src/components/common/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = 'neutral',
  onClick,
}) => {
  const statusColors = {
    good: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400',
    warning: 'border-amber-500/30 bg-amber-950/10 text-amber-400',
    critical: 'border-rose-500/30 bg-rose-950/10 text-rose-400',
    neutral: 'border-slate-800 bg-slate-900/60 text-cyan-400',
  };

  const borderClass = status === 'critical' ? 'border-rose-500/50' : status === 'warning' ? 'border-amber-500/50' : status === 'good' ? 'border-emerald-500/40' : 'border-slate-800/80';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 bg-slate-900/70 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/30 ${borderClass} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`rounded-lg p-2 ${statusColors[status]}`}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-100">{value}</div>
        {trend && <span className="text-xs font-medium text-slate-400">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
    </div>
  );
};
