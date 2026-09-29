import { Task } from '../models/task.model';

/** Today's date as 'YYYY-MM-DD' in the user's local time zone. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task: Task): boolean {
  return task.status !== 'completed' && task.deadline < todayISO();
}

export function isDueWithin(task: Task, days: number): boolean {
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return task.status !== 'completed' && task.deadline >= todayISO() && task.deadline <= toISODate(limit);
}

/** Turns rich-text HTML into plain text, e.g. for card previews and tooltips. */
export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html ?? '';
  return div.textContent?.trim() ?? '';
}

/** Toolbar used by every rich text editor in the app. */
export const EDITOR_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean']
  ]
};
