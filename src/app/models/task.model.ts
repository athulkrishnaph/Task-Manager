export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string; // HTML from the rich text editor
  deadline: string;    // 'YYYY-MM-DD'
  status: TaskStatus;
  createdAt: string;   // ISO date-time
  updatedAt: string;
}

/** The fields a user can fill in when creating or editing a task. */
export type TaskInput = Pick<Task, 'title' | 'description' | 'deadline' | 'status'>;

/** Single list of statuses used by every dropdown, badge and legend in the app. */
export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

export function statusLabel(status: TaskStatus): string {
  return TASK_STATUSES.find(s => s.value === status)?.label ?? status;
}
