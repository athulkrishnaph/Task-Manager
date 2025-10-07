import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {}

  // GET - Get all comments
  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.apiUrl);
  }

  // GET - Get comment by ID
  getCommentById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`);
  }

  // GET - Get comments for a specific task
  getCommentsForTask(taskId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?taskId=${taskId}`);
  }

  // GET - Get top-level comments (no parentId)
  getTopLevelComments(taskId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?taskId=${taskId}&parentId=`);
  }

  // GET - Get replies for a specific comment
  getRepliesForComment(commentId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?parentId=${commentId}`);
  }

  // POST - Create new comment
  createComment(comment: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  // PUT - Update existing comment
  updateComment(id: string, comment: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, comment);
  }

  // PATCH - Partially update comment
  patchComment(id: string, updates: Partial<UpdateCommentRequest>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, updates);
  }

  // DELETE - Delete comment
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
