'use client';

import { useMemo } from 'react';
import { PRIORITY_MAP, STATUSES, STATUS_MAP, TYPE_MAP, fmtDate, isOverdue } from '@/lib/constants';
import type { Profile, Sprint, Status, Task } from '@/lib/types';
import { Avatar, displayName } from './Avatar';

export function ListView({
  tasks,
  projectKey,
  profiles,
  sprints,
  onOpen,
  onStatus,
}: {
  tasks: Task[];
  projectKey: string;
  profiles: Profile[];
  sprints: Sprint[];
  onOpen: (id: string) => void;
  onStatus: (id: string, status: Status) => void;
}) {
  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const sprintMap = useMemo(() => new Map(sprints.map((s) => [s.id, s])), [sprints]);
  const sorted = useMemo(() => [...tasks].sort((a, b) => b.number - a.number), [tasks]);

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-slate-400">
        Nenhuma tarefa encontrada com esses filtros.
      </div>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-600/60 text-[11px] uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3">Chave</th>
            <th className="px-2 py-3">Tarefa</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-2 py-3">Prioridade</th>
            <th className="px-2 py-3">Responsável</th>
            <th className="px-2 py-3">Sprint</th>
            <th className="px-2 py-3">Prazo</th>
            <th className="px-2 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const type = TYPE_MAP[t.type];
            const prio = PRIORITY_MAP[t.priority];
            const TypeIcon = type.icon;
            const PrioIcon = prio.icon;
            const assignee = t.assignee_id ? profileMap.get(t.assignee_id) : null;
            const sprint = t.sprint_id ? sprintMap.get(t.sprint_id) : null;
            const overdue = isOverdue(t.due_date, t.status);
            return (
              <tr
                key={t.id}
                onClick={() => onOpen(t.id)}
                className="cursor-pointer border-b border-ink-700/50 transition hover:bg-ink-700/40"
              >
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-slate-300">
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded"
                      style={{ background: type.color }}
                      title={type.label}
                    >
                      <TypeIcon size={11} className="text-ink-950" strokeWidth={3} />
                    </span>
                    {projectKey}-{t.number}
                  </span>
                </td>
                <td className="max-w-[360px] truncate px-2 py-2.5 font-medium text-slate-100">{t.title}</td>
                <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={t.status}
                    onChange={(e) => onStatus(t.id, e.target.value as Status)}
                    className="cursor-pointer rounded-md border bg-ink-900 px-2 py-1 text-xs font-semibold outline-none"
                    style={{ color: STATUS_MAP[t.status].color, borderColor: STATUS_MAP[t.status].color + '66' }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: prio.color }}>
                    <PrioIcon size={15} strokeWidth={3} /> {prio.label}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <Avatar profile={assignee} size={22} />
                    {assignee ? displayName(assignee) : <span className="text-slate-500">Sem responsável</span>}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-xs text-slate-300">
                  {sprint ? sprint.name : <span className="text-slate-600">—</span>}
                </td>
                <td className={`px-2 py-2.5 text-xs ${overdue ? 'font-semibold text-red-400' : 'text-slate-300'}`}>
                  {t.due_date ? fmtDate(t.due_date) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-2 py-2.5 text-right text-xs text-slate-300">{t.story_points ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
