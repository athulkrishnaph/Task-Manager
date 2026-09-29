import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskService extends ApiService<Task> {
  constructor() {
    super('tasks');
  }
}
