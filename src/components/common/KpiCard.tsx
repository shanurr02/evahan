import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

interface KpiCardProps {
  id?: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string;
    positive: boolean;
    neutral?: boolean;
    label?: string;
  };
  context?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate' | 'blue' | 'red';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  icon: Icon,
  label,
  value,
  unit,
  trend,
  context,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    red: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800/40',
    rose: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/40',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/40',
    amber: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/40',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-800/40',
    blue: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/40',
    slate: 'text-slate-700 bg-slate-100 border-slate-200 dark:text-zinc-400 dark:bg-zinc-900 dark:border-zinc-700/60',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-blue-400 hover:shadow-sm dark:border-[#202026] dark:bg-[#0a0a0c] dark:hover:border-red-500/50 dark:hover:bg-[#141418] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colorMap[color]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {label}
          </span>
        </div>
        {onClick && (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-red-400" />
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-xl font-black tracking-tight text-slate-900 font-mono-num dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{unit}</span>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        {trend ? (
          <div className="flex items-center gap-1">
            {trend.neutral ? (
              <span className="font-semibold text-slate-500 font-mono-num dark:text-zinc-400">{trend.value}</span>
            ) : trend.positive ? (
              <span className="flex items-center font-bold text-emerald-600 font-mono-num dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {trend.value}
              </span>
            ) : (
              <span className="flex items-center font-bold text-rose-600 font-mono-num dark:text-red-400">
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
                {trend.value}
              </span>
            )}
            <span className="text-slate-400 text-[10px] dark:text-zinc-500">{trend.label || 'vs prev'}</span>
          </div>
        ) : (
          <div />
        )}
        {context && (
          <span className="text-slate-400 text-right truncate text-[10px] max-w-[55%] dark:text-zinc-400">
            {context}
          </span>
        )}
      </div>
    </div>
  );
};
