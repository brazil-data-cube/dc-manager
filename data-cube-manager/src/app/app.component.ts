import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { Store, select } from '@ngrx/store'
import { NgxSpinnerService } from 'ngx-spinner'

import { AppState } from './app.state'
import { TokenModal } from './shared/token/token.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public token: string = null

  constructor(
    public location: Location,
    private store: Store<AppState>,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog) {

    this.store.pipe(select('app' as any)).subscribe(res => {
      if (res.loading) {
        this.spinner.show()
      } else {
        this.spinner.hide()
      }

      if (res.token) {
        this.token = res.token
      }
    });
  }

  ngOnInit() {
    if (!this.token) {
      this.openTokenModal()
    }
  }

  openTokenModal() {
    const dialogRef = this.dialog.open(TokenModal, {
      width: '450px',
      disableClose: true
    })
  }
}
