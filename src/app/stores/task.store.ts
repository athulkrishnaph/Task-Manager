import { Injectable } from '@angular/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { Task, TaskInput, TaskStatus } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { isDueWithin, isOverdue } from '../utils/task.utils';
import { RequestState, trackRequest } from './track-request';

@Injectable({ providedIn: 'root' })
export class TaskStore implements RequestState {
  tasks: Task[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private api: TaskService) {
    makeAutoObservable(this);
    this.load();
  }

  get stats() {
    return {
      total: this.tasks.length,
      pending: this.countByStatus('pending'),
      inProgress: this.countByStatus('in_progress'),
      completed: this.countByStatus('completed'),
      overdue: this.tasks.filter(isOverdue).length,
      dueThisWeek: this.tasks.filter(task => isDueWithin(task, 7)).length
    };
  }

  countByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  load() {
    return trackRequest(this, 'Could not load tasks. Is json-server running (npm run json-server)?', async () => {
      const tasks = await this.api.getAll();
      runInAction(() => (this.tasks = tasks));
    });
  }

  add(input: TaskInput) {
    const now = new Date().toISOString();
    return trackRequest(this, 'Could not create the task.', async () => {
      const task = await this.api.create({ ...input, createdAt: now, updatedAt: now });
      runInAction(() => this.tasks.push(task));
    });
  }

  update(id: string, changes: Partial<TaskInput>) {
    return trackRequest(this, 'Could not update the task.', async () => {
      const updated = await this.api.update(id, { ...changes, updatedAt: new Date().toISOString() });
      runInAction(() => (this.tasks = this.tasks.map(task => (task.id === id ? updated : task))));
    });
  }

  delete(id: string) {
    return trackRequest(this, 'Could not delete the task.', async () => {
      // `_dependent` tells json-server to delete the task's comments as well.
      await this.api.delete(id, { _dependent: 'comments' });
      runInAction(() => (this.tasks = this.tasks.filter(task => task.id !== id)));
    });
  }

  clearError() {
    this.error = null;
  }
}
