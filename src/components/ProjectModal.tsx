'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Modal } from './Modal';

function suggestKey(name: string): string {
  const words = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 4);
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 5);
}

export function ProjectModal({
  project,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  project?: Project;
  onClose: () => void;
  onCreate: (input: { name: string; key: string; description: string | null }) => Promise<unknown>;
  onUpdate: (id: string, patch: { name: string; description: string | null }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const editing = Boolean(project);
  const [name, setName] = useState(project?.name ?? '');
  const [key, setKey] = useState(project?.key ?? '');
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState(project?.description ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (project) await onUpdate(project.id, { name: name.trim(), description: description.trim() || null });
      else await onCreate({ name: name.trim(), key, description: description.trim() || null });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível salvar.';
      setError(msg.includes('duplicate') ? 'Já existe um projeto com essa chave.' : msg);
      setBusy(false);
    }
  }

  async function remove() {
    if (!project) return;
    if (
      !window.confirm(
        `Excluir o projeto "${project.name}" e TODAS as suas tarefas, sprints e comentários? Isso não pode ser desfeito.`,
      )
    )
      return;
    setBusy(true);
    try {
      await onDelete(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
      setBusy(false);
    }
  }

  const keyValid = /^[A-Z0-9]{2,6}$/.test(key);

  return (
    <Modal title={editing ? 'Editar projeto' : 'Novo projeto'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome</label>
          <input
            className="input"
            autoFocus
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editing && !keyTouched) setKey(suggestKey(e.target.value));
            }}
            placeholder="Ex.: Plataforma Web"
          />
        </div>
        <div>
          <label className="label">Chave (prefixo das tarefas)</label>
          <input
            className="input font-mono uppercase"
            required
            disabled={editing}
            maxLength={6}
            value={key}
            onChange={(e) => {
              setKeyTouched(true);
              setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            }}
            placeholder="TDV"
          />
          <p className="mt-1 text-xs text-slate-500">
            2 a 6 letras/números. {editing ? 'Não pode ser alterada.' : `As tarefas serão ${key || 'TDV'}-1, ${key || 'TDV'}-2…`}
          </p>
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sobre o que é esse projeto?"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <button className="btn-fire flex-1" disabled={busy || !name.trim() || (!editing && !keyValid)}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {editing ? 'Salvar' : 'Criar projeto'}
          </button>
          {editing && (
            <button type="button" onClick={remove} disabled={busy} className="btn-danger" title="Excluir projeto">
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
