import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingComponent } from './loading/loading.component';
import { AlertComponent } from './alert/alert.component';
import { TokenModal } from './token/token.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormFieldErrorComponent } from './form-field-input/form-field-error.component';

/**
 * Shared Module
 * used to export components, services and models common in this application
 */
@NgModule({
  declarations: [
    LoadingComponent,
    TokenModal,
    AlertComponent,
    FormFieldErrorComponent
  ],
  exports: [
    LoadingComponent,
    AlertComponent,
    FormFieldErrorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    NgxSpinnerModule
  ],
  entryComponents: [
    TokenModal
  ]
})
export class SharedModule { }
