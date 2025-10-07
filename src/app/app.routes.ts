import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { 
    path: 'tasks', 
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent)
  },
  { 
    path: 'tasks/:id', 
    loadComponent: () => import('./components/task-details/task-details.component').then(m => m.TaskDetailsComponent)
  },
  { 
    path: 'calendar', 
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
  }
];
