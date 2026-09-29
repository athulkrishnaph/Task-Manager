import { Component, Input } from '@angular/core';

/**
 * Friendly placeholder for empty lists. Anything placed inside the tag (e.g. a button) is shown below the text.
 * Usage: <app-empty-state icon="📝" title="No tasks" message="Add your first task">...</app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input({ required: true }) title = '';
  @Input() message = '';
}
