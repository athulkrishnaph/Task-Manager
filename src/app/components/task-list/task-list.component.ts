import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskStatus, CreateTaskRequest } from '../../models/task.model';
import { RootStore } from '../../stores/root.store';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  constructor(
    private router: Router,
    private rootStore: RootStore,
    private fb: FormBuilder
  ) {}

  // Make TaskStatus available in template
  TaskStatus = TaskStatus;

  tasks: Task[] = [];
  showAddForm = false;
  isEditing = false;
  editingTask: Task | null = null;

  // Reactive form
  taskForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.loadTasks();
  }

  initializeForm() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      deadline: ['', [Validators.required, this.futureDateValidator]],
      status: [TaskStatus.PENDING, Validators.required]
    });
  }

  // Custom validator for future dates
  futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  loadTasks() {
    this.rootStore.taskStore.loadTasks().then(() => {
      this.tasks = this.rootStore.taskStore.allTasks;
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
      month: 'short',
      day: 'numeric'
    });
  }

  isOverdue(deadline: Date): boolean {
    const task = this.tasks.find(t => t.deadline === deadline);
    return new Date(deadline) < new Date() && task?.status !== TaskStatus.COMPLETED;
  }

  showAddTaskForm() {
    this.showAddForm = true;
    this.isEditing = false;
    this.editingTask = null;
    this.resetForm();
  }

  showEditTaskForm(task: Task) {
    this.showAddForm = true;
    this.isEditing = true;
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline).toISOString().split('T')[0], // Format for date input
      status: task.status
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.isEditing = false;
    this.editingTask = null;
    this.resetForm();
  }

  resetForm() {
    this.taskForm.reset({
      title: '',
      description: '',
      deadline: '',
      status: TaskStatus.PENDING
    });
  }

  async saveTask() {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const taskData: CreateTaskRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      deadline: new Date(formValue.deadline),
      status: formValue.status
    };

    try {
      if (this.isEditing && this.editingTask) {
        await this.rootStore.taskStore.updateTask({
          id: this.editingTask.id,
          ...taskData
        });
      } else {
        await this.rootStore.taskStore.addTask(taskData);
      }
      
      this.loadTasks();
      this.cancelForm();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  }

  markFormGroupTouched() {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
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
      if (field.errors['pastDate']) {
        return 'Deadline must be a future date';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  async deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await this.rootStore.taskStore.deleteTask(task.id);
        this.loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  }

  async updateTaskStatus(task: Task, newStatus: TaskStatus) {
    try {
      await this.rootStore.taskStore.updateTask({
        id: task.id,
        status: newStatus
      });
      this.loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  }

  viewTaskDetails(task: Task) {
    this.router.navigate(['/tasks', task.id]);
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}