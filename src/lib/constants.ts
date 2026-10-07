import {
  Bookmark,
  Bug,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Equal,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Priority, SprintStatus, Status, TaskType } from './types';

export const STATUSES: { id: Status; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#7C8DB5' },
  { id: 'todo', label: 'A fazer', color: '#3CC8FF' },
  { id: 'in_progress', label: 'Em andamento', color: '#2F7BFF' },
  { id: 'review', label: 'Em revisão', color: '#FF9A1F' },
  { id: 'done', label: 'Concluído', color: '#34D399' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
  Status,
  (typeof STATUSES)[number]
>;

export const PRIORITIES: { id: Priority; label: string; color: string; icon: LucideIcon }[] = [
  { id: 'highest', label: 'Crítica', color: '#FF4D5E', icon: ChevronsUp },
  { id: 'high', label: 'Alta', color: '#FF7A3D', icon: ChevronUp },
  { id: 'medium', label: 'Média', color: '#FF9A1F', icon: Equal },
  { id: 'low', label: 'Baixa', color: '#3CC8FF', icon: ChevronDown },
  { id: 'lowest', label: 'Mínima', color: '#7C8DB5', icon: ChevronsDown },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.id, p])) as Record<
  Priority,
  (typeof PRIORITIES)[number]
>;

export const TYPES: { id: TaskType; label: string; color: string; icon: LucideIcon }[] = [
  { id: 'task', label: 'Tarefa', color: '#2F7BFF', icon: Check },
  { id: 'bug', label: 'Bug', color: '#FF4D5E', icon: Bug },
  { id: 'story', label: 'História', color: '#34D399', icon: Bookmark },
  { id: 'epic', label: 'Épico', color: '#A78BFA', icon: Zap },
];

export const TYPE_MAP = Object.fromEntries(TYPES.map((t) => [t.id, t])) as Record<
  TaskType,
  (typeof TYPES)[number]
>;

export const SPRINT_STATUS: Record<SprintStatus, { label: string; color: string }> = {
  planned: { label: 'Planejada', color: '#7C8DB5' },
  active: { label: 'Ativa', color: '#34D399' },
  closed: { label: 'Concluída', color: '#2F7BFF' },
};

export function fmtDate(d?: string | null): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function fmtShort(d?: string | null): string {
  if (!d) return '';
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
}

export function isOverdue(d: string | null | undefined, status: Status): boolean {
  if (!d || status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day) < today;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
