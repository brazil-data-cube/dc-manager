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
import { FormGroup, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'app-create-cube-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class CreateCubeDefinitionComponent implements OnInit {

  public temporalCompositions: TemporalComposition[]
  public compositeFunctions: CompositeFunction[]
  public buckets: object[]
  public formCreateCube: FormGroup

  constructor(
    private store: Store<AdminState>,
    private cbs: CubeBuilderService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog) { 
      this.formCreateCube = this.fb.group({
        bucket: ['', [Validators.required]],
        name: ['', [Validators.required]],
        resolution: ['', [Validators.required]],
        temporalComposite: ['', [Validators.required]],
        compositeFunctions: [{value: ['IDENTITY', 'MED', 'STK'], disabled: true}, [Validators.required]],
        bands: [[''], [Validators.required]],
        bandsQuicklook: [[''], [Validators.required]]
      });
    }

  ngOnInit() {
    this.getTemporalCompositions()
    this.getCompositeFunctions()
    this.getBuckets()
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

  async getBuckets() {
    try {
      this.store.dispatch(showLoading())
      const response = await this.cbs.getBuckets()
      this.buckets = response

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

  getCubeFullName() {
    const name = this.formCreateCube.get('name').value
    const resolution = this.formCreateCube.get('resolution').value
    const temporalComposite = this.formCreateCube.get('temporalComposite').value
    let tcFormated = temporalComposite.substring(1)
    tcFormated = tcFormated.replace('month', 'M').replace('day', 'D')
    if (tcFormated === 'null') {
      return `${name}_${resolution}`
    } else {
      return `${name}_${resolution}_${tcFormated}`
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
