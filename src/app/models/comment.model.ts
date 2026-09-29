export interface Comment {
  id: string;
  taskId: string;
  parentId?: string; // set when the comment is a reply
  author: string;
  content: string;
  createdAt: string; // ISO date-time
}

/** The fields a user fills in on the comment / reply form. */
export type CommentInput = Pick<Comment, 'author' | 'content'>;
