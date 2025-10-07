import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import { Task, TaskStatus } from '../../models/task.model';
import { RootStore } from '../../stores/root.store';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  constructor(
    private router: Router,
    private rootStore: RootStore
  ) {}

  // Make TaskStatus available in template
  TaskStatus = TaskStatus;

  tasks: Task[] = [];
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: [],
    eventClick: this.onEventClick.bind(this),
    eventDidMount: this.onEventDidMount.bind(this),
    height: 'auto',
    aspectRatio: 1.8,
    dayMaxEvents: true,
    moreLinkClick: 'popover',
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  };

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasks = this.rootStore.taskStore.allTasks;
    this.updateCalendarEvents();
  }

  updateCalendarEvents() {
    const events: EventInput[] = this.tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.deadline),
      allDay: true,
      backgroundColor: this.getTaskColor(task.status),
      borderColor: this.getTaskBorderColor(task.status),
      textColor: this.getTaskTextColor(task.status),
      extendedProps: {
        task: task
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  getTaskColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return '#f6ad55'; // Orange
      case TaskStatus.IN_PROGRESS:
        return '#4299e1'; // Blue
      case TaskStatus.COMPLETED:
        return '#48bb78'; // Green
      default:
        return '#a0aec0'; // Gray
    }
  }

  getTaskBorderColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return '#ed8936';
      case TaskStatus.IN_PROGRESS:
        return '#3182ce';
      case TaskStatus.COMPLETED:
        return '#38a169';
      default:
        return '#718096';
    }
  }

  getTaskTextColor(status: TaskStatus): string {
    return '#ffffff';
  }

  onEventClick(info: any) {
    const task = info.event.extendedProps.task;
    if (task) {
      this.router.navigate(['/tasks', task.id]);
    }
  }

  onEventDidMount(info: any) {
    const task = info.event.extendedProps.task;
    if (task) {
      // Add tooltip with task details
      const element = info.el;
      element.title = `${task.title}\nStatus: ${this.getStatusText(task.status)}\nDescription: ${task.description.substring(0, 100)}...`;
    }
  }

  getStatusText(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pending';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return '';
    }
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  getOverdueTasks(): number {
    const now = new Date();
    return this.tasks.filter(task => 
      new Date(task.deadline) < now && task.status !== TaskStatus.COMPLETED
    ).length;
  }

  getUpcomingTasks(): number {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= nextWeek && task.status !== TaskStatus.COMPLETED;
    }).length;
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }
}