'use client';

import { useRef } from 'react';
import { KanbanSquare, LayoutDashboard, List, LogOut, Plus, X } from 'lucide-react';
import type { Profile, Project } from '@/lib/types';
import { Avatar, displayName } from './Avatar';
import { Logo } from './Logo';

export type View = 'board' | 'list' | 'dashboard';

const NAV: { id: View; label: string; icon: typeof List }[] = [
  { id: 'board', label: 'Quadro', icon: KanbanSquare },
  { id: 'list', label: 'Lista', icon: List },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const AVATAR_PX = 128;

// Recorta a imagem em quadrado e reduz para AVATAR_PX, retornando um data URL JPEG leve.
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = AVATAR_PX;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Não foi possível processar a imagem.'));
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        AVATAR_PX,
        AVATAR_PX,
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Arquivo de imagem inválido.'));
    };
    img.src = url;
  });
}

export function Sidebar({
  projects,
  selectedId,
  onSelect,
  onNewProject,
  view,
  onView,
  profiles,
  me,
  onLogout,
  onAvatarChange,
  onAvatarError,
  open,
  onCloseMobile,
}: {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewProject: () => void;
  view: View;
  onView: (v: View) => void;
  profiles: Profile[];
  me?: Profile | null;
  onLogout: () => void;
  onAvatarChange: (dataUrl: string) => void;
  onAvatarError: (message: string) => void;
  open: boolean;
  onCloseMobile: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return onAvatarError('Selecione um arquivo de imagem.');
    try {
      onAvatarChange(await resizeImage(file));
    } catch (err) {
      onAvatarError(err instanceof Error ? err.message : 'Falha ao carregar a imagem.');
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neon/15 bg-ink-950/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <Logo size="sm" />
          <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-400 hover:bg-ink-700 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  onView(n.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-neon/20 text-white shadow-[inset_3px_0_0_#FF9A1F]'
                    : 'text-slate-400 hover:bg-ink-800 hover:text-slate-100'
                }`}
              >
                <Icon size={17} className={active ? 'text-neon-cyan' : ''} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-5 flex items-center justify-between px-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Projetos</span>
          <button
            onClick={onNewProject}
            className="rounded-md p-1 text-slate-400 transition hover:bg-ink-700 hover:text-fire"
            title="Novo projeto"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p.id);
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                selectedId === p.id ? 'bg-ink-700 text-white' : 'text-slate-300 hover:bg-ink-800'
              }`}
            >
              <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-md bg-gradient-to-b from-neon-soft to-neon px-1 font-mono text-[10px] font-bold text-white">
                {p.key}
              </span>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          {projects.length === 0 && <p className="px-2 text-xs text-slate-500">Nenhum projeto ainda.</p>}
        </div>

        <div className="border-t border-ink-700/70 px-4 py-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Equipe ({profiles.length})
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {profiles.slice(0, 12).map((p) => (
              <Avatar key={p.id} profile={p} size={26} />
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={!me}
              className="shrink-0 rounded-full transition hover:opacity-80 hover:ring-2 hover:ring-neon-cyan disabled:pointer-events-none"
              title="Alterar foto de perfil"
            >
              <Avatar profile={me} size={30} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-100">{displayName(me)}</p>
              <p className="truncate text-[11px] text-slate-500">{me?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-ink-700 hover:text-red-400"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
