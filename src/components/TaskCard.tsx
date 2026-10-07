'use client';

import type { DragEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import { PRIORITY_MAP, TYPE_MAP, fmtShort, isOverdue } from '@/lib/constants';
import type { Profile, Task } from '@/lib/types';
import { Avatar } from './Avatar';

export function TaskCard({
  task,
  projectKey,
  assignee,
  isDragging,
  isOver,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragOver,
}: {
  task: Task;
  projectKey: string;
  assignee?: Profile | null;
  isDragging: boolean;
  isOver: boolean;
  onOpen: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const type = TYPE_MAP[task.type];
  const prio = PRIORITY_MAP[task.priority];
  const TypeIcon = type.icon;
  const PrioIcon = prio.icon;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={onOpen}
      className={`group cursor-pointer rounded-xl border bg-ink-800/80 p-3 transition hover:border-neon/70 hover:shadow-neon ${
        isDragging ? 'opacity-40' : ''
      } ${isOver ? 'border-fire shadow-fire' : 'border-ink-600/60'}`}
    >
      <p className="text-sm font-medium leading-snug text-slate-100">{task.title}</p>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span
              key={l}
              className="rounded bg-neon/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neon-cyan"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded"
            style={{ background: type.color }}
            title={type.label}
          >
            <TypeIcon size={11} className="text-ink-950" strokeWidth={3} />
          </span>
          <span className="font-mono text-[11px] font-semibold text-slate-400">
            {projectKey}-{task.number}
          </span>
          {task.due_date && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                overdue ? 'font-semibold text-red-400' : 'text-slate-400'
              }`}
              title="Prazo"
            >
              <CalendarDays size={11} />
              {fmtShort(task.due_date)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {task.story_points != null && (
            <span className="rounded-full bg-ink-600/60 px-1.5 text-[11px] font-semibold text-slate-300">
              {task.story_points}
            </span>
          )}
          <span title={`Prioridade: ${prio.label}`} style={{ color: prio.color }}>
            <PrioIcon size={16} strokeWidth={3} />
          </span>
          <Avatar profile={assignee} size={22} />
        </div>
      </div>
    </div>
  );
}
