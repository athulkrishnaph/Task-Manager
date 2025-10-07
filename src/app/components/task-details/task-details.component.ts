import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { Task, TaskStatus, UpdateTaskRequest } from '../../models/task.model';
import { Comment, CreateCommentRequest } from '../../models/comment.model';
import { RootStore } from '../../stores/root.store';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QuillModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rootStore: RootStore,
    private fb: FormBuilder
  ) {}

  task: Task | null = null;
  comments: Comment[] = [];
  isEditing = false;
  isLoading = false;

  // Rich text editor configuration
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['bullet', 'ordered'],
      ['link'],
      ['clean']
    ],
    theme: 'snow'
  };

  // Comment forms
  commentForm!: FormGroup;
  replyForm!: FormGroup;
  replyToComment: Comment | null = null;

  ngOnInit() {
    this.initializeForms();
    this.route.params.subscribe(params => {
      const taskId = params['id'];
      if (taskId) {
        this.loadTask(taskId);
        this.loadComments(taskId);
      }
    });
  }

  initializeForms() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      content: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });

    this.replyForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      content: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  loadTask(taskId: string) {
    this.task = this.rootStore.taskStore.getTaskById(taskId) || null;
    if (!this.task) {
      this.router.navigate(['/tasks']);
    }
  }

  loadComments(taskId: string) {
    this.rootStore.commentStore.loadCommentsForTask(taskId).then(() => {
      this.comments = this.rootStore.commentStore.getCommentsForTask(taskId);
      console.log('Loaded comments in component:', this.comments);
    });
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'status-pending';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  getStatusText(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pending';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOverdue(deadline: Date): boolean {
    return new Date(deadline) < new Date() && this.task?.status !== TaskStatus.COMPLETED;
  }

  async updateTaskStatus(newStatus: TaskStatus) {
    if (!this.task) return;

    try {
      this.isLoading = true;
      await this.rootStore.taskStore.updateTask({
        id: this.task.id,
        status: newStatus
      });
      this.loadTask(this.task.id);
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    } finally {
      this.isLoading = false;
    }
  }

  async updateTaskDescription(newDescription: string) {
    if (!this.task) return;

    try {
      this.isLoading = true;
      await this.rootStore.taskStore.updateTask({
        id: this.task.id,
        description: newDescription
      });
      this.loadTask(this.task.id);
      this.isEditing = false;
    } catch (error) {
      console.error('Error updating task description:', error);
      alert('Failed to update task description');
    } finally {
      this.isLoading = false;
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
  }

  async addComment() {
    if (this.commentForm.invalid) {
      this.markFormGroupTouched(this.commentForm);
      return;
    }

    if (!this.task) return;

    const formValue = this.commentForm.value;
    const commentData: CreateCommentRequest = {
      taskId: this.task.id,
      content: formValue.content.trim(),
      author: formValue.author.trim()
    };

    try {
      this.isLoading = true;
      await this.rootStore.commentStore.addComment(commentData);
      this.loadComments(this.task.id);
      this.commentForm.reset();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      this.isLoading = false;
    }
  }

  async addReply(parentComment: Comment) {
    if (this.replyForm.invalid) {
      this.markFormGroupTouched(this.replyForm);
      return;
    }

    if (!this.task) return;

    const formValue = this.replyForm.value;
    const replyData: CreateCommentRequest = {
      taskId: this.task.id,
      content: formValue.content.trim(),
      author: formValue.author.trim(),
      parentId: parentComment.id
    };

    try {
      this.isLoading = true;
      await this.rootStore.commentStore.addComment(replyData);
      this.loadComments(this.task.id);
      this.replyForm.reset();
      this.replyToComment = null;
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteComment(comment: Comment) {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        this.isLoading = true;
        await this.rootStore.commentStore.deleteComment(comment.id);
        this.loadComments(this.task!.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      } finally {
        this.isLoading = false;
      }
    }
  }

  startReply(comment: Comment) {
    this.replyToComment = comment;
    this.replyForm.reset();
  }

  cancelReply() {
    this.replyToComment = null;
    this.replyForm.reset();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }

  getRepliesForComment(commentId: string): Comment[] {
    const comment = this.comments.find(c => c.id === commentId);
    const replies = comment?.replies || [];
    console.log(`Replies for comment ${commentId}:`, replies);
    return replies;
  }

  getTopLevelComments(): Comment[] {
    console.log('Top level comments:', this.comments);
    return this.comments;
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }
}