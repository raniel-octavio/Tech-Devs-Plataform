'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Menu, Pencil, Plus, Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Filters, Status } from '@/lib/types';
import { Board } from './Board';
import { Dashboard } from './Dashboard';
import { FilterBar, defaultFilters } from './FilterBar';
import { ListView } from './ListView';
import { Rocket } from './Logo';
import { ProjectModal } from './ProjectModal';
import { Sidebar, type View } from './Sidebar';
import { SprintModal } from './SprintModal';
import { TaskModal } from './TaskModal';

type TaskModalState = { mode: 'new'; status: Status } | { mode: 'edit'; id: string } | null;

export function AppShell({ session }: { session: Session }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [view, setView] = useState<View>('board');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [taskModal, setTaskModal] = useState<TaskModalState>(null);
  const [projectModal, setProjectModal] = useState<'new' | 'edit' | null>(null);
  const [sprintModal, setSprintModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const ws = useWorkspace(projectId);
  const project = ws.projects.find((p) => p.id === projectId) ?? null;
  const me = ws.profiles.find((p) => p.id === session.user.id) ?? null;

  // seleciona projeto salvo / primeiro projeto
  useEffect(() => {
    if (ws.baseLoading) return;
    if (projectId && ws.projects.some((p) => p.id === projectId)) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('td:project');
    } catch {}
    const pick = ws.projects.find((p) => p.id === saved) ?? ws.projects[0] ?? null;
    setProjectId(pick?.id ?? null);
  }, [ws.baseLoading, ws.projects, projectId]);

  useEffect(() => {
    if (!projectId) return;
    try {
      localStorage.setItem('td:project', projectId);
    } catch {}
    setFilters(defaultFilters);
  }, [projectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function safe(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Algo deu errado.');
    }
  }

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return ws.tasks.filter((t) => {
      if (q) {
        const key = `${project?.key ?? ''}-${t.number}`.toLowerCase();
        const hay = `${t.title} ${t.description ?? ''} ${t.labels.join(' ')} ${key}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.assignee === 'none' ? t.assignee_id : filters.assignee !== 'all' && t.assignee_id !== filters.assignee)
        return false;
      if (filters.sprint === 'none' ? t.sprint_id : filters.sprint !== 'all' && t.sprint_id !== filters.sprint)
        return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      return true;
    });
  }, [ws.tasks, filters, project?.key]);

  const editingTask = taskModal?.mode === 'edit' ? ws.tasks.find((t) => t.id === taskModal.id) : undefined;

  return (
    <div className="bg-space flex h-screen overflow-hidden">
      <Sidebar
        projects={ws.projects}
        selectedId={projectId}
        onSelect={setProjectId}
        onNewProject={() => setProjectModal('new')}
        view={view}
        onView={setView}
        profiles={ws.profiles}
        me={me}
        onLogout={() => supabase.auth.signOut()}
        open={menuOpen}
        onCloseMobile={() => setMenuOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {project ? (
          <>
            <header className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-4 sm:px-6">
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-lg p-2 text-slate-300 hover:bg-ink-700 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-display text-2xl font-black italic tracking-tight text-white">
                    {project.name}
                  </h1>
                  <button
                    onClick={() => setProjectModal('edit')}
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-ink-700 hover:text-white"
                    title="Editar projeto"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                {project.description && <p className="truncate text-sm text-slate-400">{project.description}</p>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setSprintModal(true)} className="btn-ghost">
                  <Timer size={16} /> Sprints
                </button>
                <button onClick={() => setTaskModal({ mode: 'new', status: 'todo' })} className="btn-fire">
                  <Plus size={16} /> Nova tarefa
                </button>
              </div>
            </header>

            {view !== 'dashboard' && (
              <div className="px-4 pb-3 sm:px-6">
                <FilterBar filters={filters} onChange={setFilters} profiles={ws.profiles} sprints={ws.sprints} />
              </div>
            )}

            {ws.error && (
              <p className="mx-4 mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 sm:mx-6">
                {ws.error} — confira se o <code className="font-mono">supabase/schema.sql</code> foi executado.
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 sm:px-6">
              {ws.loading ? (
                <div className="flex h-full items-center justify-center">
                  <Rocket className="h-20 w-auto animate-float" />
                </div>
              ) : view === 'board' ? (
                <Board
                  tasks={filtered}
                  projectKey={project.key}
                  profiles={ws.profiles}
                  onOpen={(id) => setTaskModal({ mode: 'edit', id })}
                  onMove={(id, patch) => safe(() => ws.updateTask(id, patch))}
                  onQuickAdd={(status, title) => safe(() => ws.createTask({ title, status }))}
                />
              ) : view === 'list' ? (
                <ListView
                  tasks={filtered}
                  projectKey={project.key}
                  profiles={ws.profiles}
                  sprints={ws.sprints}
                  onOpen={(id) => setTaskModal({ mode: 'edit', id })}
                  onStatus={(id, status) => safe(() => ws.updateTask(id, { status }))}
                />
              ) : (
                <Dashboard tasks={ws.tasks} profiles={ws.profiles} sprints={ws.sprints} />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="absolute left-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-ink-700 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            {ws.baseLoading ? (
              <Rocket className="h-24 w-auto animate-float" />
            ) : (
              <>
                <Rocket className="mb-4 h-32 w-auto animate-float drop-shadow-[0_0_30px_rgba(47,123,255,.6)]" />
                <h2 className="font-display text-3xl font-black italic text-white">Hora de decolar</h2>
                <p className="mt-2 max-w-sm text-slate-400">
                  Crie o primeiro projeto da equipe para começar a organizar as atividades.
                </p>
                {ws.error && <p className="mt-3 max-w-md text-sm text-red-300">{ws.error}</p>}
                <button onClick={() => setProjectModal('new')} className="btn-fire mt-5">
                  <Plus size={16} /> Criar projeto
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* modais */}
      {project && taskModal?.mode === 'new' && (
        <TaskModal
          mode="new"
          defaultStatus={taskModal.status}
          project={project}
          profiles={ws.profiles}
          sprints={ws.sprints}
          currentUserId={session.user.id}
          onClose={() => setTaskModal(null)}
          onCreate={ws.createTask}
          onUpdate={ws.updateTask}
          onDelete={ws.deleteTask}
        />
      )}
      {project && taskModal?.mode === 'edit' && editingTask && (
        <TaskModal
          key={editingTask.id}
          mode="edit"
          task={editingTask}
          project={project}
          profiles={ws.profiles}
          sprints={ws.sprints}
          currentUserId={session.user.id}
          onClose={() => setTaskModal(null)}
          onCreate={ws.createTask}
          onUpdate={ws.updateTask}
          onDelete={ws.deleteTask}
        />
      )}
      {projectModal && (
        <ProjectModal
          project={projectModal === 'edit' ? (project ?? undefined) : undefined}
          onClose={() => setProjectModal(null)}
          onCreate={async (input) => {
            const created = await ws.createProject(input);
            setProjectId(created.id);
          }}
          onUpdate={ws.updateProject}
          onDelete={ws.deleteProject}
        />
      )}
      {project && sprintModal && (
        <SprintModal
          sprints={ws.sprints}
          tasks={ws.tasks}
          onClose={() => setSprintModal(false)}
          onCreate={ws.createSprint}
          onStart={(id) => ws.updateSprint(id, { status: 'active' })}
          onClose_={ws.closeSprint}
          onDelete={ws.deleteSprint}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[60] max-w-sm animate-pop rounded-xl border border-red-500/50 bg-ink-900 px-4 py-3 text-sm text-red-200 shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
