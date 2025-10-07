export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  deadline: Date;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  deadline?: Date;
  status?: TaskStatus;
}