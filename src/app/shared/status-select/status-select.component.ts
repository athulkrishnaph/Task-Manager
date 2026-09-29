import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TASK_STATUSES, TaskStatus } from '../../models/task.model';

/** Dropdown to change a task's status. Usage: <app-status-select [value]="task.status" (changed)="..." /> */
@Component({
  selector: 'app-status-select',
  templateUrl: './status-select.component.html'
})
export class StatusSelectComponent {
  @Input({ required: true }) value!: TaskStatus;
  @Input() disabled = false;
  @Output() changed = new EventEmitter<TaskStatus>();

  statuses = TASK_STATUSES;
}
