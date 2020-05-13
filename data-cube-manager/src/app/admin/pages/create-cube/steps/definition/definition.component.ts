import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { MatDialog } from '@angular/material/dialog'

import { showLoading, closeLoading } from 'app/app.action'
import { AdminState } from 'app/admin/admin.state'
import { TemporalComposition, CompositeFunction, Form } from './definition.interface'
import { TemporalCompositionModal } from './temporal/temporal.component'
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EstimateCostModal } from './estimate-cost/estimate-cost.component'

@Component({
  selector: 'app-create-cube-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class CreateCubeDefinitionComponent implements OnInit {

  public temporalCompositions: TemporalComposition[]
  public compositeFunctions: CompositeFunction[]
  public form: Form

  constructor(
    private store: Store<AdminState>,
    private cbs: CubeBuilderService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.reset()
    this.getTemporalCompositions()
    this.getCompositeFunctions()
  }

  reset() {
    this.form = {
      name: '',
      resolution: null,
      temporalComposite: '',
      compositeFunctions: ['IDENTITY', 'MED', 'STK'],
      bands: [],
      bandsQuicklook: []
    }
  }

  async getTemporalCompositions() {
    try {
      this.store.dispatch(showLoading())
      const response = await this.cbs.getTemporalCompositions()
      this.temporalCompositions = response

    } catch (err) {
      this.snackBar.open(err.error.toString(), '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading())
    }
  }

  async getCompositeFunctions() {
    try {
      this.store.dispatch(showLoading())
      const response = await this.cbs.getCompositeFunctions()
      this.compositeFunctions = response

    } catch (err) {
      this.snackBar.open(err.error.toString(), '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading())
    }
  }

  openModalTemporal() {
    const dialogRef = this.dialog.open(TemporalCompositionModal, {
      width: '450px',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(result => {
      this.getTemporalCompositions()
    })
  }

  openModalCost() {
    const dialogRef = this.dialog.open(EstimateCostModal, {
      width: '600px'
    })
  }
}
