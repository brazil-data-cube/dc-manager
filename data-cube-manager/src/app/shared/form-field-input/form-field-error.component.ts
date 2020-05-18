import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/**
 * Field Errors
 * component to display errors and valid fileds in forms
 */
@Component({
  selector: 'form-field-error',
  templateUrl: './form-field-error.component.html',
  styleUrls: ['./form-field-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldErrorComponent {

  /** prefix of error */
  @Input() errorPrefix: string;
  /** validations Object by Errors */
  @Input() errors: ValidationErrors;

}
