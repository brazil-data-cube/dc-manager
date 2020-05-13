import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';

import { AppState } from './app.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
      public location: Location,
      private store: Store<AppState>,
      private spinner: NgxSpinnerService) {

        this.store.pipe(select('app' as any)).subscribe(res => {
          if (res.loading) {
            this.spinner.show();
          } else {
            this.spinner.hide();
          }
        });
    }

    ngOnInit(){
    }

    isMap(path){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      titlee = titlee.slice( 1 );
      if(path == titlee){
        return false;
      }
      else {
        return true;
      }
    }
}
