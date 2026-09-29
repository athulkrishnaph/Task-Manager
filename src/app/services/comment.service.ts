import { Injectable } from '@angular/core';
import { Comment } from '../models/comment.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CommentService extends ApiService<Comment> {
  constructor() {
    super('comments');
  }
}
