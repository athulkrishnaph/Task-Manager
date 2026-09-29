import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentStore } from '../../stores/comment.store';
import { FieldErrorComponent } from '../field-error/field-error.component';

/**
 * Form to post a comment, or a reply when `parentId` is given.
 * Usage: <app-comment-form [taskId]="task.id" />  or  <app-comment-form [taskId]="task.id" [parentId]="comment.id" (done)="..." />
 */
@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.css'
})
export class CommentFormComponent {
  @Input({ required: true }) taskId!: string;
  @Input() parentId?: string;
  @Output() done = new EventEmitter<void>();

  constructor(private commentStore: CommentStore) {}
  saving = false;

  form = new FormGroup({
    author: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] })
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { author, content } = this.form.getRawValue();
    this.saving = true;
    const ok = await this.commentStore.add(this.taskId, { author: author.trim(), content: content.trim() }, this.parentId);
    this.saving = false;

    if (ok) {
      this.form.reset({ author, content: '' }); // keep the name for the next comment
      this.done.emit();
    }
  }
}
