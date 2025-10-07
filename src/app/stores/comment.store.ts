import { makeAutoObservable, runInAction } from 'mobx';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.model';
import { CommentService } from '../services/comment.service';

export class CommentStore {
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private commentService: CommentService) {
    makeAutoObservable(this);
  }

  // Load comments for a specific task from API and build nested structure
  async loadCommentsForTask(taskId: string) {
    this.isLoading = true;
    this.error = null;

    try {
      const allComments = await this.commentService.getCommentsForTask(taskId).toPromise();
      runInAction(() => {
        // Build nested structure from flat API response
        this.comments = this.buildNestedStructure(allComments || []);
        this.isLoading = false;
        console.log('Comments loaded from API with nested structure:', this.comments);
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load comments';
        this.isLoading = false;
      });
      console.error('Error loading comments:', error);
    }
  }

  // Build nested structure from flat comment array
  private buildNestedStructure(flatComments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build nested structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        // This is a reply, add it to parent's replies array
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  }

  // Get comments for a specific task with nested structure
  getCommentsForTask(taskId: string): Comment[] {
    return this.comments.filter(comment => comment.taskId === taskId && !comment.parentId);
  }

  // Get all comments for a specific task (including replies) in a flat array
  getAllCommentsForTask(taskId: string): Comment[] {
    const allComments: Comment[] = [];
    
    const topLevelComments = this.comments.filter(comment => comment.taskId === taskId && !comment.parentId);
    
    topLevelComments.forEach(comment => {
      // Add the main comment
      allComments.push(comment);
      
      // Add all replies if they exist
      if (comment.replies && comment.replies.length > 0) {
        allComments.push(...comment.replies);
      }
    });
    
    console.log('All comments for task', taskId, ':', allComments);
    return allComments;
  }

  // Get replies for a specific comment
  getRepliesForComment(commentId: string): Comment[] {
    const comment = this.comments.find(c => c.id === commentId);
    return comment?.replies || [];
  }

  // Add new comment
  async addComment(commentData: CreateCommentRequest): Promise<Comment> {
    this.isLoading = true;
    this.error = null;

    try {
      // Add timestamps before sending to API
      const commentWithTimestamps = {
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newComment = await this.commentService.createComment(commentWithTimestamps).toPromise();
      runInAction(() => {
        if (newComment) {
          if (commentData.parentId) {
            // Add as reply to existing comment
            this.addReplyToParent(commentData.parentId, newComment);
          } else {
            // Add as top-level comment
            this.comments.push({ ...newComment, replies: [] });
          }
        }
        this.isLoading = false;
        console.log('Added new comment:', newComment);
        console.log('All comments after adding:', this.comments);
      });
      return newComment!;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to add comment';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Helper method to add reply to parent comment
  private addReplyToParent(parentId: string, reply: Comment) {
    const parentComment = this.findCommentById(parentId);
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push({ ...reply, replies: [] });
    }
  }

  // Helper method to find comment by ID (including nested replies)
  private findCommentById(id: string): Comment | null {
    for (const comment of this.comments) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies) {
        const found = this.findReplyById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper method to find reply by ID recursively
  private findReplyById(replies: Comment[], id: string): Comment | null {
    for (const reply of replies) {
      if (reply.id === id) {
        return reply;
      }
      if (reply.replies) {
        const found = this.findReplyById(reply.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Update existing comment
  async updateComment(commentData: UpdateCommentRequest): Promise<Comment> {
    this.isLoading = true;
    this.error = null;

    try {
      // Add updatedAt timestamp before sending to API
      const commentWithTimestamp = {
        ...commentData,
        updatedAt: new Date().toISOString()
      };

      const updatedComment = await this.commentService.patchComment(commentData.id, commentWithTimestamp).toPromise();
      runInAction(() => {
        if (updatedComment) {
          // Find and update the comment in nested structure
          this.updateCommentInNestedStructure(updatedComment);
        }
        this.isLoading = false;
      });

      return updatedComment!;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update comment';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Helper method to update comment in nested structure
  private updateCommentInNestedStructure(updatedComment: Comment) {
    // Check top-level comments
    for (let i = 0; i < this.comments.length; i++) {
      if (this.comments[i].id === updatedComment.id) {
        this.comments[i] = updatedComment;
        return;
      }
    }

    // Check nested replies
    for (const comment of this.comments) {
      if (comment.replies && this.updateReplyInNestedStructure(comment.replies, updatedComment)) {
        return;
      }
    }
  }

  // Helper method to update reply in nested structure recursively
  private updateReplyInNestedStructure(replies: Comment[], updatedComment: Comment): boolean {
    for (let i = 0; i < replies.length; i++) {
      if (replies[i].id === updatedComment.id) {
        replies[i] = updatedComment;
        return true;
      }
      if (replies[i].replies && this.updateReplyInNestedStructure(replies[i].replies!, updatedComment)) {
        return true;
      }
    }
    return false;
  }

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await this.commentService.deleteComment(id).toPromise();
      runInAction(() => {
        // Find and remove the comment from nested structure
        this.removeCommentById(id);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to delete comment';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Helper method to remove comment by ID from nested structure
  private removeCommentById(id: string): boolean {
    // Check top-level comments
    for (let i = 0; i < this.comments.length; i++) {
      if (this.comments[i].id === id) {
        this.comments.splice(i, 1);
        return true;
      }
    }

    // Check nested replies
    for (const comment of this.comments) {
      if (comment.replies && this.removeReplyById(comment.replies, id)) {
        return true;
      }
    }

    return false;
  }

  // Helper method to remove reply by ID recursively
  private removeReplyById(replies: Comment[], id: string): boolean {
    for (let i = 0; i < replies.length; i++) {
      if (replies[i].id === id) {
        replies.splice(i, 1);
        return true;
      }
      if (replies[i].replies && this.removeReplyById(replies[i].replies!, id)) {
        return true;
      }
    }
    return false;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

}