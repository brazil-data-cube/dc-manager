import { Component, Input } from '@angular/core';

/**
 * Alert component
 * simple static component
 */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  /** type of alert (error/warning) */
  @Input('type') type: string;
  /** message to display */
  @Input('message') message: string;

  /** return icon by type */
  public getIcon(type: string): string {
    switch (type) {
      case 'error':
        return 'error_outline';
      case 'warning':
        return 'warning';
    }
  }

}
