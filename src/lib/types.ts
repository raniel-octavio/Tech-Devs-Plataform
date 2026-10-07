export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type TaskType = 'task' | 'bug' | 'story' | 'epic';
export type SprintStatus = 'planned' | 'active' | 'closed';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_color: string | null;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  number: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  type: TaskType;
  assignee_id: string | null;
  reporter_id: string | null;
  sprint_id: string | null;
  story_points: number | null;
  due_date: string | null;
  labels: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export type NewTask = Partial<
  Pick<
    Task,
    | 'description'
    | 'priority'
    | 'type'
    | 'assignee_id'
    | 'sprint_id'
    | 'story_points'
    | 'due_date'
    | 'labels'
  >
> &
  Pick<Task, 'title' | 'status'>;

export interface Filters {
  q: string;
  assignee: string; // 'all' | 'none' | profile id
  priority: string; // 'all' | Priority
  type: string; // 'all' | TaskType
  sprint: string; // 'all' | 'none' | sprint id
}
