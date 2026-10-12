import React from 'react';
import { VehicleStatus, AlarmSeverity, JobStatus, DocumentStatus, IssueStatus } from '../../types';

interface StatusBadgeProps {
  status: VehicleStatus | AlarmSeverity | JobStatus | DocumentStatus | IssueStatus | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = true }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/80';
  let dot = 'bg-slate-400 dark:bg-zinc-400';

  switch (status) {
    case 'Running':
    case 'Active':
    case 'Working':
    case 'Valid':
    case 'Resolved':
    case 'Completed':
    case 'Approved':
    case 'Paid':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50';
      dot = 'bg-emerald-500 dark:bg-emerald-400';
      break;

    case 'Idle':
    case 'Delayed':
    case 'Attention Required':
    case 'Expiring Soon':
    case 'Due Soon':
    case 'Due Today':
    case 'Pending Review':
    case 'Pending Approval':
    case 'Pending':
    case 'In Progress':
    case 'Medium':
    case 'Acknowledged':
      bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50';
      dot = 'bg-amber-500 dark:bg-amber-400';
      break;

    case 'Critical':
    case 'High':
    case 'Overdue':
    case 'Expired':
    case 'Breakdown':
    case 'Not Working':
    case 'Rejected':
      bg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700/60';
      dot = 'bg-rose-500 dark:bg-red-500';
      break;

    case 'Parked':
    case 'Planned':
    case 'Upcoming':
    case 'Low':
    case 'Open':
      bg = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-700/70';
      dot = 'bg-blue-500 dark:bg-blue-400';
      break;

    case 'Inactive':
    case 'Removed':
    case 'On Leave':
    case 'Suspended':
    default:
      bg = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80';
      dot = 'bg-slate-400 dark:bg-zinc-500';
      break;
  }

  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px] font-semibold' : 'px-2 py-0.5 text-[11px] font-bold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border whitespace-nowrap ${bg} ${sizeClass}`}>
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'Running' ? 'animate-pulse' : ''}`} />
      )}
      <span>{status}</span>
    </span>
  );
};
