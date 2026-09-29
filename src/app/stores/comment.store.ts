import { Injectable } from '@angular/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { Comment, CommentInput } from '../models/comment.model';
import { CommentService } from '../services/comment.service';
import { RequestState, trackRequest } from './track-request';

/** Holds the comments (and replies) of the task that is currently open. */
@Injectable({ providedIn: 'root' })
export class CommentStore implements RequestState {
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private api: CommentService) {
    makeAutoObservable(this);
  }

  /** Comments that are not replies, newest first. */
  get topLevel(): Comment[] {
    return this.comments.filter(c => !c.parentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Replies to one comment, oldest first. */
  repliesOf(commentId: string): Comment[] {
    return this.comments.filter(c => c.parentId === commentId);
  }

  load(taskId: string) {
    this.comments = [];
    return trackRequest(this, 'Could not load comments.', async () => {
      const comments = await this.api.getAll({ taskId });
      runInAction(() => (this.comments = comments));
    });
  }

  add(taskId: string, input: CommentInput, parentId?: string) {
    return trackRequest(this, 'Could not save the comment.', async () => {
      const comment = await this.api.create({ ...input, taskId, parentId, createdAt: new Date().toISOString() });
      runInAction(() => this.comments.push(comment));
    });
  }

  /** Deletes a comment together with its replies. */
  delete(comment: Comment) {
    const ids = [comment.id, ...this.repliesOf(comment.id).map(reply => reply.id)];
    return trackRequest(this, 'Could not delete the comment.', async () => {
      await Promise.all(ids.map(id => this.api.delete(id)));
      runInAction(() => (this.comments = this.comments.filter(c => !ids.includes(c.id))));
    });
  }

  clearError() {
    this.error = null;
  }
}
