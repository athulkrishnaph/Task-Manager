import { Pipe, PipeTransform } from '@angular/core';
import { stripHtml } from '../utils/task.utils';

/** Removes HTML tags, e.g. to preview a rich-text description. Usage: {{ task.description | plainText }} */
@Pipe({ name: 'plainText' })
export class PlainTextPipe implements PipeTransform {
  transform(html: string): string {
    return stripHtml(html);
  }
}
