export interface Comment {
  id: string;
  taskId: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  taskId: string;
  content: string;
  author: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  id: string;
  content: string;
}