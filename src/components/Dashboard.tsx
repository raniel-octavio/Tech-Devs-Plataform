'use client';

import { useMemo, type ReactNode } from 'react';
import { PRIORITIES, STATUSES, isOverdue } from '@/lib/constants';
import type { Profile, Sprint, Task } from '@/lib/types';
import { Avatar, displayName } from './Avatar';

function Stat({ label, value, accent }: { label: string; value: ReactNode; accent: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-display text-4xl font-black italic" style={{ color: accent, textShadow: `0 0 18px ${accent}66` }}>
        {value}
      </p>
    </div>
  );
}

function Bar({ label, value, max, color, left }: { label: ReactNode; value: number; max: number; color: string; left?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex w-36 shrink-0 items-center gap-2 truncate text-slate-300">
        {left}
        <span className="truncate">{label}</span>
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-700/70">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color, boxShadow: `0 0 10px ${color}88` }}
        />
      </div>
      <span className="w-8 text-right font-semibold text-slate-200">{value}</span>
    </div>
  );
}

export function Dashboard({
  tasks,
  profiles,
  sprints,
}: {
  tasks: Task[];
  profiles: Profile[];
  sprints: Sprint[];
}) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => isOverdue(t.due_date, t.status)).length;
    const byStatus = STATUSES.map((s) => ({ ...s, count: tasks.filter((t) => t.status === s.id).length }));
    const byPriority = PRIORITIES.map((p) => ({ ...p, count: tasks.filter((t) => t.priority === p.id).length }));
    const byAssignee = [
      ...profiles.map((p) => ({
        profile: p as Profile | null,
        open: tasks.filter((t) => t.assignee_id === p.id && t.status !== 'done').length,
        done: tasks.filter((t) => t.assignee_id === p.id && t.status === 'done').length,
      })),
      {
        profile: null,
        open: tasks.filter((t) => !t.assignee_id && t.status !== 'done').length,
        done: tasks.filter((t) => !t.assignee_id && t.status === 'done').length,
      },
    ].filter((r) => r.open + r.done > 0);
    return { total, done, inProgress, overdue, byStatus, byPriority, byAssignee };
  }, [tasks, profiles]);

  const activeSprint = sprints.find((s) => s.status === 'active');
  const sprintTasks = activeSprint ? tasks.filter((t) => t.sprint_id === activeSprint.id) : [];
  const sprintPts = sprintTasks.reduce((a, t) => a + (t.story_points ?? 0), 0);
  const sprintDonePts = sprintTasks.filter((t) => t.status === 'done').reduce((a, t) => a + (t.story_points ?? 0), 0);
  const sprintPct = sprintTasks.length
    ? Math.round(
        (sprintPts
          ? sprintDonePts / sprintPts
          : sprintTasks.filter((t) => t.status === 'done').length / sprintTasks.length) * 100,
      )
    : 0;

  const maxStatus = Math.max(1, ...stats.byStatus.map((s) => s.count));
  const maxPrio = Math.max(1, ...stats.byPriority.map((s) => s.count));
  const maxAssignee = Math.max(1, ...stats.byAssignee.map((r) => r.open + r.done));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total de tarefas" value={stats.total} accent="#5B9BFF" />
        <Stat label="Em andamento" value={stats.inProgress} accent="#3CC8FF" />
        <Stat
          label="Concluídas"
          value={`${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%`}
          accent="#34D399"
        />
        <Stat label="Atrasadas" value={stats.overdue} accent={stats.overdue ? '#FF4D5E' : '#7C8DB5'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass space-y-3 rounded-2xl p-5">
          <h3 className="font-display text-base font-extrabold uppercase italic text-white">Por status</h3>
          {stats.byStatus.map((s) => (
            <Bar key={s.id} label={s.label} value={s.count} max={maxStatus} color={s.color} />
          ))}
        </div>

        <div className="glass space-y-3 rounded-2xl p-5">
          <h3 className="font-display text-base font-extrabold uppercase italic text-white">Por prioridade</h3>
          {stats.byPriority.map((p) => (
            <Bar key={p.id} label={p.label} value={p.count} max={maxPrio} color={p.color} />
          ))}
        </div>

        <div className="glass space-y-3 rounded-2xl p-5">
          <h3 className="font-display text-base font-extrabold uppercase italic text-white">Carga da equipe</h3>
          {stats.byAssignee.length === 0 && <p className="text-sm text-slate-500">Nenhuma tarefa atribuída ainda.</p>}
          {stats.byAssignee.map((r) => (
            <Bar
              key={r.profile?.id ?? 'none'}
              label={r.profile ? displayName(r.profile) : 'Sem responsável'}
              left={<Avatar profile={r.profile} size={20} />}
              value={r.open + r.done}
              max={maxAssignee}
              color="#FF9A1F"
            />
          ))}
          {stats.byAssignee.length > 0 && (
            <p className="text-xs text-slate-500">Total de tarefas por pessoa (abertas + concluídas).</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base font-extrabold uppercase italic text-white">Sprint ativa</h3>
          {activeSprint ? (
            <div className="mt-3">
              <p className="font-semibold text-slate-100">{activeSprint.name}</p>
              {activeSprint.goal && <p className="mt-0.5 text-sm text-slate-400">{activeSprint.goal}</p>}
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-700/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon to-fire"
                  style={{ width: `${sprintPct}%`, boxShadow: '0 0 14px rgba(255,154,31,.5)' }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {sprintPct}% concluído · {sprintTasks.filter((t) => t.status === 'done').length}/{sprintTasks.length}{' '}
                tarefas
                {sprintPts > 0 && ` · ${sprintDonePts}/${sprintPts} pontos`}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Nenhuma sprint ativa. Crie e inicie uma em “Sprints”.</p>
          )}
        </div>
      </div>
    </div>
  );
}
