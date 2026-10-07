'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Play, Plus, Trash2 } from 'lucide-react';
import { SPRINT_STATUS, fmtDate } from '@/lib/constants';
import type { Sprint, Task } from '@/lib/types';
import { Modal } from './Modal';

export function SprintModal({
  sprints,
  tasks,
  onClose,
  onCreate,
  onStart,
  onClose_,
  onDelete,
}: {
  sprints: Sprint[];
  tasks: Task[];
  onClose: () => void;
  onCreate: (input: { name: string; goal: string | null; start_date: string | null; end_date: string | null }) => Promise<unknown>;
  onStart: (id: string) => Promise<unknown>;
  onClose_: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const [name, setName] = useState(`Sprint ${sprints.length + 1}`);
  const [goal, setGoal] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      await onCreate({ name: name.trim(), goal: goal.trim() || null, start_date: start || null, end_date: end || null });
      setName(`Sprint ${sprints.length + 2}`);
      setGoal('');
      setStart('');
      setEnd('');
    });
  }

  const ordered = [...sprints].sort((a, b) => {
    const rank = { active: 0, planned: 1, closed: 2 } as const;
    return rank[a.status] - rank[b.status];
  });

  return (
    <Modal title="Sprints" onClose={onClose} wide>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2.5">
          <h3 className="label">Sprints do projeto</h3>
          {ordered.length === 0 && <p className="text-sm text-slate-500">Nenhuma sprint criada ainda.</p>}
          {ordered.map((s) => {
            const st = SPRINT_STATUS[s.status];
            const list = tasks.filter((t) => t.sprint_id === s.id);
            const done = list.filter((t) => t.status === 'done').length;
            return (
              <div key={s.id} className="rounded-xl border border-ink-600/50 bg-ink-900/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{s.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: st.color, background: st.color + '22' }}
                  >
                    {st.label}
                  </span>
                </div>
                {s.goal && <p className="mt-1 text-sm text-slate-400">{s.goal}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  {s.start_date || s.end_date ? `${fmtDate(s.start_date) || '?'} → ${fmtDate(s.end_date) || '?'} · ` : ''}
                  {done}/{list.length} tarefas concluídas
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {s.status === 'planned' && (
                    <button disabled={busy} onClick={() => run(() => onStart(s.id))} className="btn-primary !px-2.5 !py-1 text-xs">
                      <Play size={12} /> Iniciar
                    </button>
                  )}
                  {s.status === 'active' && (
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            'Concluir a sprint? As tarefas não finalizadas voltam para "Sem sprint" (backlog).',
                          )
                        )
                          run(() => onClose_(s.id));
                      }}
                      className="btn-fire !px-2.5 !py-1 text-xs"
                    >
                      <CheckCircle2 size={12} /> Concluir
                    </button>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Excluir "${s.name}"? As tarefas ficam sem sprint.`)) run(() => onDelete(s.id));
                    }}
                    className="btn-danger !px-2.5 !py-1 text-xs"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={create} className="space-y-3.5">
          <h3 className="label">Nova sprint</h3>
          <div>
            <label className="label">Nome</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Meta</label>
            <textarea
              className="input min-h-[70px] resize-y"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Qual o objetivo dessa sprint?"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="label">Início</label>
              <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="label">Fim</label>
              <input className="input" type="date" min={start || undefined} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <button className="btn-fire w-full" disabled={busy || !name.trim()}>
            <Plus size={16} /> Criar sprint
          </button>
        </form>
      </div>
    </Modal>
  );
}
