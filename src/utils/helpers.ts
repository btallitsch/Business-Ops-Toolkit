import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import type { KPI, KPIStatus, FollowUp, Decision } from '../types';

// ─── Date Helpers ──────────────────────────────────────────────────────────────

export const formatDate = (dateStr: string): string =>
  format(new Date(dateStr), 'MMM d, yyyy');

export const formatShortDate = (dateStr: string): string =>
  format(new Date(dateStr), 'MMM d');

export const formatRelative = (dateStr: string): string =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

export const formatDateTime = (dateStr: string): string =>
  format(new Date(dateStr), 'MMM d, yyyy · h:mm a');

export const isDueSoon = (dateStr: string, days = 3): boolean => {
  const diff = differenceInDays(new Date(dateStr), new Date());
  return diff >= 0 && diff <= days;
};

export const isOverdue = (dateStr: string): boolean =>
  isPast(new Date(dateStr)) && !isToday(new Date(dateStr));

export const getDueDateLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isOverdue(dateStr)) return `Overdue · ${formatDate(dateStr)}`;
  if (isToday(d)) return 'Due today';
  if (isTomorrow(d)) return 'Due tomorrow';
  if (isDueSoon(dateStr)) return `Due ${formatRelative(dateStr)}`;
  return `Due ${formatDate(dateStr)}`;
};

// ─── KPI Helpers ──────────────────────────────────────────────────────────────

export const computeKPIProgress = (kpi: KPI): number => {
  const range = kpi.targetValue - kpi.startValue;
  if (range === 0) return 100;
  const progress = ((kpi.currentValue - kpi.startValue) / range) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
};

export const computeKPIStatus = (kpi: KPI): KPIStatus => {
  const progress = computeKPIProgress(kpi);
  const daysTotal = differenceInDays(new Date(kpi.targetDate), new Date(kpi.startDate));
  const daysElapsed = differenceInDays(new Date(), new Date(kpi.startDate));
  const expectedProgress = daysTotal > 0 ? Math.min((daysElapsed / daysTotal) * 100, 100) : 100;

  if (progress >= 100) return 'exceeded';
  if (progress >= expectedProgress) return 'on-track';
  if (progress >= expectedProgress * 0.7) return 'at-risk';
  return 'off-track';
};

export const formatKPIValue = (value: number, unit: string): string => {
  if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  if (unit === '%') {
    return `${value}%`;
  }
  return `${value.toLocaleString()} ${unit}`;
};

// ─── Statistics Helpers ────────────────────────────────────────────────────────

export const getKPISummary = (kpis: KPI[]) => ({
  total: kpis.length,
  onTrack: kpis.filter((k) => k.status === 'on-track' || k.status === 'exceeded').length,
  atRisk: kpis.filter((k) => k.status === 'at-risk').length,
  offTrack: kpis.filter((k) => k.status === 'off-track').length,
});

export const getDecisionSummary = (decisions: Decision[]) => ({
  total: decisions.length,
  implemented: decisions.filter((d) => d.status === 'implemented').length,
  inProgress: decisions.filter((d) => d.status === 'in-progress').length,
  proposed: decisions.filter((d) => d.status === 'proposed').length,
});

export const getFollowUpSummary = (followUps: FollowUp[]) => ({
  total: followUps.length,
  pending: followUps.filter((f) => f.status === 'pending' || f.status === 'in-progress').length,
  overdue: followUps.filter((f) => isOverdue(f.dueDate) && f.status !== 'completed' && f.status !== 'cancelled').length,
  dueSoon: followUps.filter((f) => isDueSoon(f.dueDate) && f.status !== 'completed' && f.status !== 'cancelled').length,
  completed: followUps.filter((f) => f.status === 'completed').length,
});

// ─── Color Mapping ─────────────────────────────────────────────────────────────

export const statusColors: Record<string, string> = {
  'on-track': '#4ade80',
  'at-risk': '#fb923c',
  'off-track': '#f87171',
  exceeded: '#818cf8',
  proposed: '#94a3b8',
  approved: '#60a5fa',
  'in-progress': '#fb923c',
  implemented: '#4ade80',
  reversed: '#f87171',
  pending: '#94a3b8',
  waiting: '#60a5fa',
  completed: '#4ade80',
  cancelled: '#475569',
  urgent: '#f87171',
  high: '#fb923c',
  medium: '#fbbf24',
  low: '#94a3b8',
};

export const priorityOrder: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};
