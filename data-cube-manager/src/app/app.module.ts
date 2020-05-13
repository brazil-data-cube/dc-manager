import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app.routing';

import * as fromApp from './app.reducer';
import * as fromAdmin from './admin/admin.reducer';
import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    AppRoutingModule,
    AdminModule,
    SharedModule,
    StoreModule.forRoot({
      app: fromApp.reducer,
      admin: fromAdmin.reducer,
    }),
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
