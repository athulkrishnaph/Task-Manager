import { Injectable, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  confirm(message: string, title = 'Are you sure?'): Promise<boolean> {
    return new Promise(resolve => {
      // Create the component dynamically
      const ref = createComponent(ConfirmDialogComponent, {
        environmentInjector: this.injector,
      });

      ref.instance.title = title;
      ref.instance.message = message;

      // Subscribe to the output events
      ref.instance.confirmed.subscribe(() => {
        resolve(true);
        cleanup();
      });
      ref.instance.cancelled.subscribe(() => {
        resolve(false);
        cleanup();
      });

      // Attach to the app and DOM
      this.appRef.attachView(ref.hostView);
      const domElem = (ref.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
      ref.changeDetectorRef.detectChanges();

      function cleanup() {
        document.body.removeChild(domElem);
        ref.destroy();
      }
    });
  }
}
