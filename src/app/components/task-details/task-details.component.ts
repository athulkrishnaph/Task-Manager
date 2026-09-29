import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Comment } from '../../models/comment.model';
import { Task, TaskStatus } from '../../models/task.model';
import { CommentStore } from '../../stores/comment.store';
import { TaskStore } from '../../stores/task.store';
import { isOverdue } from '../../utils/task.utils';
import { CommentFormComponent } from '../../shared/comment-form/comment-form.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { StatusSelectComponent } from '../../shared/status-select/status-select.component';
import { TaskFormComponent } from '../../shared/task-form/task-form.component';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-task-details',
  imports: [DatePipe, RouterLink, CommentFormComponent, EmptyStateComponent, StatusBadgeComponent, StatusSelectComponent, TaskFormComponent],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent implements OnInit {
  constructor(
    public taskStore: TaskStore,
    public commentStore: CommentStore,
    private route: ActivatedRoute,
    private router: Router,
    private confirm: ConfirmDialogService
  ) {}

  taskId = '';
  formOpen = false;
  replyingTo: string | null = null; // id of the comment being replied to
  isOverdue = isOverdue;

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') ?? '';
    this.commentStore.load(this.taskId);
  }

  /** Read from the store, so it updates automatically once tasks are loaded or edited. */
  get task(): Task | undefined {
    return this.taskStore.getById(this.taskId);
  }

  changeStatus(status: TaskStatus) {
    this.taskStore.update(this.taskId, { status });
  }

  async deleteTask(task: Task) {
    const ok = await this.confirm.confirm(
      `"${(task.title.length>20)? task.title.slice(0,20)+'...':task.title}" and all its comments will be permanently removed.`,
      'Delete task?'
    );
    if (ok) {
      const done = await this.taskStore.delete(task.id);
      if (done) this.router.navigate(['/tasks']);
    }
  }

  async deleteComment(comment: Comment) {
    const ok = await this.confirm.confirm(
      'This comment and all its replies will be permanently removed.',
      'Delete comment?'
    );
    if (ok) this.commentStore.delete(comment);
  }
}
