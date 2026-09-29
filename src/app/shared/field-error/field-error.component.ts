import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Shows the validation message for one form control once the user has touched it.
 * Usage: <app-field-error [control]="form.controls.title" label="Title" />
 */
@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html'
})
export class FieldErrorComponent {
  @Input({ required: true }) control!: AbstractControl;
  @Input() label = 'This field';

  get message(): string {
    const errors = this.control.errors;
    if (!errors || !this.control.touched) return '';

    if (errors['required']) return `${this.label} is required`;
    if (errors['minlength']) return `${this.label} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.label} must be at most ${errors['maxlength'].requiredLength} characters`;
    if (errors['pastDate']) return `${this.label} cannot be in the past`;
    return `${this.label} is invalid`;
  }
}
