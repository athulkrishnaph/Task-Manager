import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:3000';

/**
 * Reusable CRUD helper for one json-server collection.
 * Extend it with the collection name, e.g. `class TaskService extends ApiService<Task> { ... super('tasks') }`.
 */
export class ApiService<T extends { id: string }> {
  private http = inject(HttpClient);
  private url: string;

  constructor(collection: string) {
    this.url = `${API_URL}/${collection}`;
  }

  getAll(params: Record<string, string> = {}): Promise<T[]> {
    return firstValueFrom(this.http.get<T[]>(this.url, { params }));
  }

  create(item: Omit<T, 'id'>): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.url, item));
  }

  update(id: string, changes: Partial<T>): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`${this.url}/${id}`, changes));
  }

  delete(id: string, params: Record<string, string> = {}): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`, { params }));
  }
}
