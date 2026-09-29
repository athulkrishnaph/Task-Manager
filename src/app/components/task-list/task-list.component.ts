import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Task, TASK_STATUSES, TaskStatus } from '../../models/task.model';
import { TaskStore } from '../../stores/task.store';
import { isOverdue, stripHtml } from '../../utils/task.utils';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { PlainTextPipe } from '../../shared/plain-text.pipe';
import { Stat, StatsBarComponent } from '../../shared/stats-bar/stats-bar.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { StatusSelectComponent } from '../../shared/status-select/status-select.component';
import { TaskFormComponent } from '../../shared/task-form/task-form.component';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe, FormsModule, RouterLink, PlainTextPipe,
    EmptyStateComponent, StatsBarComponent, StatusBadgeComponent, StatusSelectComponent, TaskFormComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  constructor(
    public taskStore: TaskStore,
    private confirm: ConfirmDialogService
  ) {}

  statuses = TASK_STATUSES;
  isOverdue = isOverdue;

  // Filters
  statusFilter: TaskStatus | 'all' = 'all';
  search = '';

  // Add / edit modal
  formOpen = false;
  editingTask?: Task;

  get stats(): Stat[] {
    const s = this.taskStore.stats;
    return [
      { label: 'Total tasks', value: s.total },
      { label: 'In progress', value: s.inProgress, tone: 'in_progress' },
      { label: 'Overdue', value: s.overdue, tone: 'overdue' },
      { label: 'Completed', value: s.completed, tone: 'completed' }
    ];
  }

  /** Tasks after applying the status tab and search box, soonest deadline first. */
  get visibleTasks(): Task[] {
    const search = this.search.trim().toLowerCase();
    return this.taskStore.tasks
      .filter(task => this.statusFilter === 'all' || task.status === this.statusFilter)
      .filter(task => !search || `${task.title} ${stripHtml(task.description)}`.toLowerCase().includes(search))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }

  openForm(task?: Task) {
    this.editingTask = task;
    this.formOpen = true;
  }

  changeStatus(task: Task, status: TaskStatus) {
    this.taskStore.update(task.id, { status });
  }

  async deleteTask(task: Task) {
    const ok = await this.confirm.confirm(
      `"${(task.title.length>20)? task.title.slice(0,20)+'...':task.title}" and all its comments will be permanently removed.`,
      'Delete task?'
    );
    if (ok) this.taskStore.delete(task.id);
  }
}
