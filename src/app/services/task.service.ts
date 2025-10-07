import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  // GET - Get all tasks
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // GET - Get task by ID
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // POST - Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // PUT - Update existing task
  updateTask(id: string, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  // PATCH - Partially update task
  patchTask(id: string, updates: Partial<UpdateTaskRequest>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates);
  }

  // DELETE - Delete task
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET - Get tasks by status
  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?status=${status}`);
  }
}
