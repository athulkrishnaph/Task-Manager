import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommentStore } from './stores/comment.store';
import { TaskStore } from './stores/task.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    private taskStore: TaskStore,
    private commentStore: CommentStore
  ) {}

  /** The latest error from any store, shown in a banner at the top of the page. */
  get error(): string | null {
    return this.taskStore.error ?? this.commentStore.error;
  }

  dismissError() {
    this.taskStore.clearError();
    this.commentStore.clearError();
  }
}
