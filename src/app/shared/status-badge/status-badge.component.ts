import { Component, Input } from '@angular/core';
import { statusLabel, TaskStatus } from '../../models/task.model';

/** Coloured pill showing a task status. Usage: <app-status-badge [status]="task.status" /> */
@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html'
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TaskStatus;

  get label(): string {
    return statusLabel(this.status);
  }
}
