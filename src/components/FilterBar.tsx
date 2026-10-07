'use client';

import { Search, X } from 'lucide-react';
import { PRIORITIES, TYPES } from '@/lib/constants';
import type { Filters, Profile, Sprint } from '@/lib/types';
import { displayName } from './Avatar';

export const defaultFilters: Filters = {
  q: '',
  assignee: 'all',
  priority: 'all',
  type: 'all',
  sprint: 'all',
};

export function FilterBar({
  filters,
  onChange,
  profiles,
  sprints,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  profiles: Profile[];
  sprints: Sprint[];
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const dirty = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Buscar tarefa ou chave…"
          className="input pl-9"
        />
      </div>

      <select className="input !w-auto" value={filters.assignee} onChange={(e) => set({ assignee: e.target.value })}>
        <option value="all">Todos os responsáveis</option>
        <option value="none">Sem responsável</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {displayName(p)}
          </option>
        ))}
      </select>

      <select className="input !w-auto" value={filters.sprint} onChange={(e) => set({ sprint: e.target.value })}>
        <option value="all">Todas as sprints</option>
        <option value="none">Sem sprint</option>
        {sprints.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.status === 'active' ? ' (ativa)' : ''}
          </option>
        ))}
      </select>

      <select className="input !w-auto" value={filters.priority} onChange={(e) => set({ priority: e.target.value })}>
        <option value="all">Toda prioridade</option>
        {PRIORITIES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <select className="input !w-auto" value={filters.type} onChange={(e) => set({ type: e.target.value })}>
        <option value="all">Todos os tipos</option>
        {TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {dirty && (
        <button onClick={() => onChange(defaultFilters)} className="btn-ghost !px-3 !py-2 text-xs">
          <X size={14} /> Limpar
        </button>
      )}
    </div>
  );
}
