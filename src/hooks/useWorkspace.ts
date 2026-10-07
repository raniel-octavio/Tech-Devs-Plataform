'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { NewTask, Profile, Project, Sprint, Task } from '@/lib/types';

function upsert<T extends { id: string }>(list: T[], row: T): T[] {
  return list.some((x) => x.id === row.id)
    ? list.map((x) => (x.id === row.id ? row : x))
    : [...list, row];
}

export function useWorkspace(projectId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  // ---- carga inicial: projetos e membros ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, pr] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('profiles').select('*').order('full_name'),
      ]);
      if (cancelled) return;
      const err = p.error || pr.error;
      if (err) setError(err.message);
      else {
        setProjects((p.data ?? []) as Project[]);
        setProfiles((pr.data ?? []) as Profile[]);
        setError(null);
      }
      setBaseLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- tarefas e sprints do projeto selecionado ----
  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setSprints([]);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      const [t, s] = await Promise.all([
        supabase.from('tasks').select('*').eq('project_id', projectId).order('position'),
        supabase.from('sprints').select('*').eq('project_id', projectId).order('created_at'),
      ]);
      if (cancelled) return;
      const err = t.error || s.error;
      if (err) setError(err.message);
      else {
        setTasks((t.data ?? []) as Task[]);
        setSprints((s.data ?? []) as Sprint[]);
        setError(null);
      }
      setDataLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ---- tempo real: todo mundo vê as mudanças na hora ----
  useEffect(() => {
    const channel = supabase
      .channel('techdevs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as Partial<Task>;
          setTasks((prev) => prev.filter((t) => t.id !== old.id));
          return;
        }
        const row = payload.new as unknown as Task;
        if (row.project_id !== projectIdRef.current) return;
        setTasks((prev) => upsert(prev, row));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sprints' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as Partial<Sprint>;
          setSprints((prev) => prev.filter((s) => s.id !== old.id));
          return;
        }
        const row = payload.new as unknown as Sprint;
        if (row.project_id !== projectIdRef.current) return;
        setSprints((prev) => upsert(prev, row));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as Partial<Project>;
          setProjects((prev) => prev.filter((p) => p.id !== old.id));
          return;
        }
        setProjects((prev) => upsert(prev, payload.new as unknown as Project));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        setProfiles((prev) => upsert(prev, payload.new as unknown as Profile));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ---- ações: projetos ----
  const createProject = useCallback(
    async (input: { name: string; key: string; description: string | null }) => {
      const { data, error } = await supabase.from('projects').insert(input).select().single();
      if (error) throw error;
      const row = data as Project;
      setProjects((prev) => upsert(prev, row));
      return row;
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, patch: { name?: string; description?: string | null }) => {
      const { data, error } = await supabase.from('projects').update(patch).eq('id', id).select().single();
      if (error) throw error;
      setProjects((prev) => upsert(prev, data as Project));
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- ações: tarefas ----
  const createTask = useCallback(
    async (input: NewTask) => {
      const pid = projectIdRef.current;
      if (!pid) throw new Error('Selecione um projeto.');
      const col = tasksRef.current.filter((t) => t.status === input.status);
      const position = col.length ? Math.max(...col.map((t) => t.position)) + 1000 : 1000;
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...input, project_id: pid, position })
        .select()
        .single();
      if (error) throw error;
      const row = data as Task;
      setTasks((prev) => upsert(prev, row));
      return row;
    },
    [],
  );

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const snapshot = tasksRef.current;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from('tasks').update(patch).eq('id', id);
    if (error) {
      setTasks(snapshot);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- ações: sprints ----
  const createSprint = useCallback(
    async (input: {
      name: string;
      goal: string | null;
      start_date: string | null;
      end_date: string | null;
    }) => {
      const pid = projectIdRef.current;
      if (!pid) throw new Error('Selecione um projeto.');
      const { data, error } = await supabase
        .from('sprints')
        .insert({ ...input, project_id: pid })
        .select()
        .single();
      if (error) throw error;
      setSprints((prev) => upsert(prev, data as Sprint));
    },
    [],
  );

  const updateSprint = useCallback(async (id: string, patch: Partial<Sprint>) => {
    const { data, error } = await supabase.from('sprints').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setSprints((prev) => upsert(prev, data as Sprint));
  }, []);

  const deleteSprint = useCallback(async (id: string) => {
    const { error } = await supabase.from('sprints').delete().eq('id', id);
    if (error) throw error;
    setSprints((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.map((t) => (t.sprint_id === id ? { ...t, sprint_id: null } : t)));
  }, []);

  // Conclui a sprint e devolve as tarefas não finalizadas para o backlog (sem sprint)
  const closeSprint = useCallback(async (id: string) => {
    const { error: e1 } = await supabase
      .from('tasks')
      .update({ sprint_id: null })
      .eq('sprint_id', id)
      .neq('status', 'done');
    if (e1) throw e1;
    const { data, error: e2 } = await supabase
      .from('sprints')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();
    if (e2) throw e2;
    setSprints((prev) => upsert(prev, data as Sprint));
    setTasks((prev) =>
      prev.map((t) => (t.sprint_id === id && t.status !== 'done' ? { ...t, sprint_id: null } : t)),
    );
  }, []);

  return {
    projects,
    profiles,
    tasks,
    sprints,
    loading: baseLoading || dataLoading,
    baseLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    createSprint,
    updateSprint,
    deleteSprint,
    closeSprint,
  };
}
