import { Injectable } from '@angular/core';
import { makeAutoObservable } from 'mobx';
import { TaskStore } from './task.store';
import { CommentStore } from './comment.store';
import { TaskService } from '../services/task.service';
import { CommentService } from '../services/comment.service';

@Injectable({
  providedIn: 'root'
})
export class RootStore {
  taskStore: TaskStore;
  commentStore: CommentStore;

  constructor(
    private taskService: TaskService,
    private commentService: CommentService
  ) {
    this.taskStore = new TaskStore(this.taskService);
    this.commentStore = new CommentStore(this.commentService);
    makeAutoObservable(this);
  }
}