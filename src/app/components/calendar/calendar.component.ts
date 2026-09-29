import { Component, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventDropArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { reaction } from 'mobx';
import { statusLabel, Task, TASK_STATUSES } from '../../models/task.model';
import { TaskStore } from '../../stores/task.store';
import { Stat, StatsBarComponent } from '../../shared/stats-bar/stats-bar.component';
import { TaskFormComponent } from '../../shared/task-form/task-form.component';

/** Converts a task into a FullCalendar event (coloured by its status class). */
function toEvent(task: Task): EventInput {
  return {
    id: task.id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    classNames: [`status-${task.status}`],
    extendedProps: { status: task.status }
  };
}

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, StatsBarComponent, TaskFormComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnDestroy {
  constructor(
    public taskStore: TaskStore,
    private router: Router,
    private zone: NgZone
  ) {
    // Rebuild the calendar events whenever tasks in the store change.
    // This lives in the constructor because class fields run before the injected services are assigned.
    // FullCalendar only picks up changes when `options` is replaced with a new object, and zone.run()
    // is needed because MobX reactions run outside Angular's NgZone.
    this.stopSync = reaction(
      () => this.taskStore.tasks.map(toEvent),
      events => this.zone.run(() => (this.options = { ...this.options, events })),
      { fireImmediately: true }
    );
  }

  private stopSync: () => void;
  statuses = TASK_STATUSES;

  // Add-task modal (opened by clicking a day)
  formOpen = false;
  newDeadline = '';

  options: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' },
    buttonText: { today: 'Today', month: 'Month', list: 'List' },
    height: 'auto',
    dayMaxEvents: 3,
    editable: true, // drag a task to another day to change its deadline
    dateClick: (info: DateClickArg) => this.addTaskOn(info.dateStr),
    eventClick: info => this.router.navigate(['/tasks', info.event.id]),
    eventDrop: (info: EventDropArg) => this.moveTask(info),
    eventDidMount: info => (info.el.title = `${info.event.title} · ${statusLabel(info.event.extendedProps['status'])}`)
  };

  get stats(): Stat[] {
    const s = this.taskStore.stats;
    return [
      { label: 'Total tasks', value: s.total },
      { label: 'Due this week', value: s.dueThisWeek, tone: 'in_progress' },
      { label: 'Overdue', value: s.overdue, tone: 'overdue' },
      { label: 'Completed', value: s.completed, tone: 'completed' }
    ];
  }

  addTaskOn(date: string) {
    this.newDeadline = date;
    this.formOpen = true;
  }

  async moveTask(info: EventDropArg) {
    const ok = await this.taskStore.update(info.event.id, { deadline: info.event.startStr });
    if (!ok) info.revert();
  }

  ngOnDestroy() {
    this.stopSync();
  }
}
