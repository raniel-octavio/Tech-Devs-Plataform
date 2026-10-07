'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { STATUSES } from '@/lib/constants';
import type { Profile, Status, Task } from '@/lib/types';
import { TaskCard } from './TaskCard';

export function Board({
  tasks,
  projectKey,
  profiles,
  onOpen,
  onMove,
  onQuickAdd,
}: {
  tasks: Task[];
  projectKey: string;
  profiles: Profile[];
  onOpen: (id: string) => void;
  onMove: (id: string, patch: { status: Status; position: number }) => void;
  onQuickAdd: (status: Status, title: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [overCard, setOverCard] = useState<string | null>(null);
  const [adding, setAdding] = useState<Status | null>(null);
  const [draft, setDraft] = useState('');

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const columns = useMemo(() => {
    const map: Record<Status, Task[]> = { backlog: [], todo: [], in_progress: [], review: [], done: [] };
    for (const t of tasks) map[t.status].push(t);
    for (const s of STATUSES) map[s.id].sort((a, b) => a.position - b.position);
    return map;
  }, [tasks]);

  function resetDrag() {
    setDragId(null);
    setOverCol(null);
    setOverCard(null);
  }

  function handleDrop(status: Status) {
    if (!dragId) return;
    const dragged = tasks.find((t) => t.id === dragId);
    if (!dragged) return resetDrag();

    let beforeId = overCard;
    if (beforeId === dragId) {
      // soltou em cima de si mesmo: só muda de coluna se for outra
      if (dragged.status === status) return resetDrag();
      beforeId = null;
    }

    const col = columns[status].filter((t) => t.id !== dragId);
    const idx = beforeId ? col.findIndex((t) => t.id === beforeId) : -1;
    let position: number;
    if (idx === -1) {
      position = col.length ? col[col.length - 1].position + 1000 : 1000;
    } else {
      const next = col[idx];
      const prev = col[idx - 1];
      position = prev ? (prev.position + next.position) / 2 : next.position - 1000;
    }
    onMove(dragId, { status, position });
    resetDrag();
  }

  function submitAdd(status: Status) {
    const title = draft.trim();
    if (title) onQuickAdd(status, title);
    setDraft('');
    setAdding(null);
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {STATUSES.map((s) => {
        const list = columns[s.id];
        const isOverCol = overCol === s.id && dragId !== null;
        return (
          <section
            key={s.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(s.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(s.id);
            }}
            className={`glass flex max-h-full w-[290px] shrink-0 flex-col rounded-2xl transition ${
              isOverCol ? 'border-neon shadow-neon' : ''
            }`}
          >
            <header className="flex items-center justify-between px-3.5 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                <h3 className="font-display text-sm font-extrabold uppercase italic tracking-wide text-slate-100">
                  {s.label}
                </h3>
                <span className="rounded-full bg-ink-600/60 px-2 text-xs font-semibold text-slate-300">
                  {list.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setAdding(s.id);
                  setDraft('');
                }}
                className="rounded-md p-1 text-slate-400 transition hover:bg-ink-700 hover:text-white"
                title="Nova tarefa"
              >
                <Plus size={16} />
              </button>
            </header>

            <div className="flex min-h-[60px] flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-2.5">
              {list.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  projectKey={projectKey}
                  assignee={t.assignee_id ? profileMap.get(t.assignee_id) : null}
                  isDragging={dragId === t.id}
                  isOver={overCard === t.id && dragId !== null && dragId !== t.id}
                  onOpen={() => onOpen(t.id)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', t.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragId(t.id);
                  }}
                  onDragEnd={resetDrag}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOverCard(t.id);
                    setOverCol(s.id);
                  }}
                />
              ))}

              {adding === s.id ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitAdd(s.id);
                    if (e.key === 'Escape') {
                      setAdding(null);
                      setDraft('');
                    }
                  }}
                  onBlur={() => submitAdd(s.id)}
                  placeholder="O que precisa ser feito? (Enter)"
                  className="input"
                />
              ) : (
                <button
                  onClick={() => {
                    setAdding(s.id);
                    setDraft('');
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 transition hover:bg-ink-700/60 hover:text-slate-200"
                >
                  <Plus size={14} /> Criar tarefa
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
