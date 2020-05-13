import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingComponent } from './loading/loading.component';

/**
 * Shared Module
 * used to export components, services and models common in this application
 */
@NgModule({
  declarations: [
    LoadingComponent,
  ],
  exports: [
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ]
})
export class SharedModule { }
