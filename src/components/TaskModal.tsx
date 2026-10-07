'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { PRIORITIES, STATUSES, TYPES, fmtDateTime } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { NewTask, Priority, Profile, Project, Sprint, Status, Task, TaskComment, TaskType } from '@/lib/types';
import { Avatar, displayName } from './Avatar';
import { Modal } from './Modal';

interface Props {
  mode: 'new' | 'edit';
  task?: Task;
  defaultStatus?: Status;
  project: Project;
  profiles: Profile[];
  sprints: Sprint[];
  currentUserId: string;
  onClose: () => void;
  onCreate: (input: NewTask) => Promise<unknown>;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function TaskModal({
  mode,
  task,
  defaultStatus,
  project,
  profiles,
  sprints,
  currentUserId,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [d, setD] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: (task?.status ?? defaultStatus ?? 'todo') as Status,
    priority: (task?.priority ?? 'medium') as Priority,
    type: (task?.type ?? 'task') as TaskType,
    assignee_id: task?.assignee_id ?? '',
    sprint_id: task?.sprint_id ?? '',
    story_points: task?.story_points?.toString() ?? '',
    due_date: task?.due_date ?? '',
    labels: (task?.labels ?? []).join(', '),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const taskId = task?.id;
  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at')
      .then(({ data }) => {
        if (!cancelled) setComments((data ?? []) as TaskComment[]);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!d.title.trim()) return;
    setBusy(true);
    setError(null);
    const points = d.story_points.trim() === '' ? null : Math.max(0, parseInt(d.story_points, 10) || 0);
    const payload = {
      title: d.title.trim(),
      description: d.description.trim() || null,
      status: d.status,
      priority: d.priority,
      type: d.type,
      assignee_id: d.assignee_id || null,
      sprint_id: d.sprint_id || null,
      story_points: points,
      due_date: d.due_date || null,
      labels: d.labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    };
    try {
      if (mode === 'new') await onCreate(payload);
      else if (task) await onUpdate(task.id, payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
      setBusy(false);
    }
  }

  async function remove() {
    if (!task) return;
    if (!window.confirm(`Excluir ${project.key}-${task.number}? Essa ação não pode ser desfeita.`)) return;
    setBusy(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
      setBusy(false);
    }
  }

  async function addComment(e: FormEvent) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body || !task) return;
    setSending(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: task.id, body })
      .select()
      .single();
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setComments((prev) => [...prev, data as TaskComment]);
    setCommentText('');
  }

  async function removeComment(id: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) setError(error.message);
    else setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <Modal
      wide
      onClose={onClose}
      title={
        mode === 'new' ? (
          'Nova tarefa'
        ) : (
          <span className="flex items-center gap-2">
            <span className="font-mono text-sm not-italic text-neon-cyan">
              {project.key}-{task?.number}
            </span>
            Editar tarefa
          </span>
        )
      }
    >
      <form onSubmit={save} className="grid gap-6 md:grid-cols-[1fr_260px]">
        {/* coluna principal */}
        <div className="space-y-4">
          <div>
            <label className="label">Título</label>
            <input
              className="input !text-base font-medium"
              autoFocus={mode === 'new'}
              required
              value={d.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ex.: Criar endpoint de login"
            />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input min-h-[140px] resize-y"
              value={d.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detalhe o que precisa ser feito, critérios de aceite, links…"
            />
          </div>

          {mode === 'edit' && task && (
            <div>
              <label className="label">Comentários ({comments.length})</label>
              <div className="space-y-2.5">
                {comments.map((c) => {
                  const author = c.author_id ? profileMap.get(c.author_id) : null;
                  return (
                    <div key={c.id} className="flex gap-2.5 rounded-xl border border-ink-600/50 bg-ink-900/60 p-3">
                      <Avatar profile={author} size={26} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-200">{displayName(author)}</span>
                          <span className="text-slate-500">{fmtDateTime(c.created_at)}</span>
                          {c.author_id === currentUserId && (
                            <button
                              type="button"
                              onClick={() => removeComment(c.id)}
                              className="ml-auto text-slate-500 transition hover:text-red-400"
                              title="Excluir comentário"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2.5 flex gap-2">
                <input
                  className="input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addComment(e as unknown as FormEvent);
                  }}
                  placeholder="Escreva um comentário…"
                />
                <button
                  type="button"
                  onClick={(e) => addComment(e as unknown as FormEvent)}
                  disabled={sending || !commentText.trim()}
                  className="btn-primary !px-3"
                  title="Enviar"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* coluna lateral */}
        <aside className="space-y-3.5">
          <div>
            <label className="label">Status</label>
            <select className="input" value={d.status} onChange={(e) => set('status', e.target.value as Status)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={d.type} onChange={(e) => set('type', e.target.value as TaskType)}>
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select className="input" value={d.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Responsável</label>
            <select className="input" value={d.assignee_id} onChange={(e) => set('assignee_id', e.target.value)}>
              <option value="">Sem responsável</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Sprint</label>
            <select className="input" value={d.sprint_id} onChange={(e) => set('sprint_id', e.target.value)}>
              <option value="">Sem sprint</option>
              {sprints
                .filter((s) => s.status !== 'closed' || s.id === d.sprint_id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="label">Pontos</label>
              <input
                className="input"
                type="number"
                min={0}
                value={d.story_points}
                onChange={(e) => set('story_points', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Prazo</label>
              <input className="input" type="date" value={d.due_date} onChange={(e) => set('due_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Etiquetas</label>
            <input
              className="input font-mono"
              value={d.labels}
              onChange={(e) => set('labels', e.target.value)}
              placeholder="react, api, urgente"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button className="btn-fire flex-1" disabled={busy || !d.title.trim()}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {mode === 'new' ? 'Criar tarefa' : 'Salvar'}
            </button>
            {mode === 'edit' && (
              <button type="button" onClick={remove} disabled={busy} className="btn-danger !px-3" title="Excluir tarefa">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </aside>
      </form>
    </Modal>
  );
}
