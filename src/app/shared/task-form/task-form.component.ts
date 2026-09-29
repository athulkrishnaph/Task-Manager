import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { Task, TASK_STATUSES, TaskStatus } from '../../models/task.model';
import { TaskStore } from '../../stores/task.store';
import { EDITOR_MODULES, todayISO } from '../../utils/task.utils';
import { FieldErrorComponent } from '../field-error/field-error.component';

/** Deadline validator: new tasks cannot be due in the past. */
const notInPast: ValidatorFn = control => (control.value && control.value < todayISO() ? { pastDate: true } : null);

/**
 * Modal to create or edit a task.
 * Create: <app-task-form (closed)="..." />   Edit: <app-task-form [task]="task" (closed)="..." />
 */
@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, QuillEditorComponent, FieldErrorComponent],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;       // task to edit; leave empty to create a new one
  @Input() deadline = '';     // default deadline for a new task (the calendar passes the clicked day)
  @Output() closed = new EventEmitter<void>();

  constructor(private taskStore: TaskStore) {}

  statuses = TASK_STATUSES;
  editorModules = EDITOR_MODULES;
  saving = false;

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true, validators: Validators.required }),
    deadline: new FormControl('', { nonNullable: true, validators: Validators.required }),
    status: new FormControl<TaskStatus>('pending', { nonNullable: true })
  });

  ngOnInit() {
    if (this.task) {
      const { title, description, deadline, status } = this.task;
      this.form.setValue({ title, description, deadline, status });
    } else {
      this.form.patchValue({ deadline: this.deadline });
      this.form.controls.deadline.addValidators(notInPast);
    }
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const input = { ...this.form.getRawValue(), title: this.form.controls.title.value.trim() };
    this.saving = true;
    const ok = this.task ? await this.taskStore.update(this.task.id, input) : await this.taskStore.add(input);
    this.saving = false;

    if (ok) this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  close() {
    this.closed.emit();
  }
}
