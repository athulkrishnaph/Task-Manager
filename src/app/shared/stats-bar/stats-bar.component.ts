import { Component, Input } from '@angular/core';

export interface Stat {
  label: string;
  value: number;
  tone?: string; // e.g. 'pending', 'in_progress', 'completed', 'overdue'
}

/** Row of number cards. Usage: <app-stats-bar [stats]="stats" /> */
@Component({
  selector: 'app-stats-bar',
  templateUrl: './stats-bar.component.html',
  styleUrl: './stats-bar.component.css'
})
export class StatsBarComponent {
  @Input({ required: true }) stats: Stat[] = [];
}
