import { makeAutoObservable, runInAction } from 'mobx';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';
import { TaskService } from '../services/task.service';

export class TaskStore {
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private taskService: TaskService) {
    makeAutoObservable(this);
    this.loadTasks();
  }

  // Load tasks from API
  async loadTasks() {
    this.isLoading = true;
    this.error = null;

    try {
      const tasks = await this.taskService.getTasks().toPromise();
      runInAction(() => {
        this.tasks = tasks || [];
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load tasks';
        this.isLoading = false;
      });
      console.error('Error loading tasks:', error);
    }
  }

  // Get all tasks
  get allTasks(): Task[] {
    return this.tasks;
  }

  // Get tasks by status
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  // Get task by ID
  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  // Add new task
  async addTask(taskData: CreateTaskRequest): Promise<Task> {
    this.isLoading = true;
    this.error = null;

    try {
      // Add timestamps before sending to API
      const taskWithTimestamps = {
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newTask = await this.taskService.createTask(taskWithTimestamps).toPromise();
      runInAction(() => {
        if (newTask) {
          this.tasks.push(newTask);
        }
        this.isLoading = false;
      });
      return newTask!;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to add task';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Update existing task
  async updateTask(taskData: UpdateTaskRequest): Promise<Task> {
    this.isLoading = true;
    this.error = null;

    try {
      // Add updatedAt timestamp before sending to API
      const taskWithTimestamp = {
        ...taskData,
        updatedAt: new Date().toISOString()
      };

      // Use PATCH instead of PUT to preserve existing fields
      const updatedTask = await this.taskService.patchTask(taskData.id, taskWithTimestamp).toPromise();
      runInAction(() => {
        if (updatedTask) {
          const taskIndex = this.tasks.findIndex(task => task.id === taskData.id);
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = updatedTask;
          }
          if (this.selectedTask?.id === taskData.id) {
            this.selectedTask = updatedTask;
          }
        }
        this.isLoading = false;
      });
      return updatedTask!;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update task';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await this.taskService.deleteTask(id).toPromise();
      runInAction(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.selectedTask?.id === id) {
          this.selectedTask = null;
        }
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to delete task';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Select task
  selectTask(task: Task | null) {
    this.selectedTask = task;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

}