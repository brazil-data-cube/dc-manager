import { Component, OnInit } from '@angular/core'
import { Store, select } from '@ngrx/store'
import { MatDialog } from '@angular/material/dialog'

import { showLoading, closeLoading } from 'app/app.action'
import { AdminState } from 'app/admin/admin.state'
import { TemporalComposition, CompositeFunction } from './definition.interface'
import { TemporalCompositionModal } from './temporal/temporal.component'
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EstimateCostModal } from './estimate-cost/estimate-cost.component'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { setDefinition } from 'app/admin/admin.action'
import { BucketsModal } from './buckets/buckets.component'

@Component({
  selector: 'app-create-cube-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class CreateCubeDefinitionComponent implements OnInit {

  public formCreateCube: FormGroup
  public temporalCompositions: TemporalComposition[]
  public compositeFunctions: CompositeFunction[]
  public buckets: object[]
  public bandsAvailable: string[]
  public definitonCompleted: boolean

  constructor(
    private store: Store<AdminState>,
    private cbs: CubeBuilderService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog) {
    this.formCreateCube = this.fb.group({
      bucket: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')]],
      resolution: ['', [Validators.required]],
      temporalComposite: ['', [Validators.required]],
      compositeFunctions: [{ value: ['IDENTITY', 'MED', 'STK'], disabled: true }, [Validators.required]],
      bands: [[''], [Validators.required]],
      quicklookR: ['', [Validators.required]],
      quicklookG: ['', [Validators.required]],
      quicklookB: ['', [Validators.required]]
    });

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.bandsAvailable) {
        const bands = res.bandsAvailable
        this.bandsAvailable = bands
        this.formCreateCube.get('bands').setValue(bands)
      }
    })
  }

  ngOnInit() {
    this.definitonCompleted = false
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

  saveInfosInStore() {
    if (this.formCreateCube.status !== 'VALID') {
      this.snackBar.open('Fill in all fields correctly', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
    } else {
      this.store.dispatch(setDefinition({
        definition: {
          bucket: this.formCreateCube.get('bucket').value,
          name: this.getCubeFullName(),
          resolution: this.formCreateCube.get('resolution').value,
          temporal: this.formCreateCube.get('temporalComposite').value,
          functions: this.formCreateCube.get('compositeFunctions').value,
          bands: this.formCreateCube.get('bands').value,
          bandsQuicklook: this.getBandsQuicklook()
        }
      }))
      this.definitonCompleted = true
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

  getBandsQuicklook() {
    const r = this.formCreateCube.get('quicklookR').value
    const g = this.formCreateCube.get('quicklookG').value
    const b = this.formCreateCube.get('quicklookB').value
    return [r, g, b]
  }

  openModalTemporal() {
    const dialogRef = this.dialog.open(TemporalCompositionModal, {
      width: '450px',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(_ => {
      this.getTemporalCompositions()
    })
  }

  openModalBuckets() {
    const dialogRef = this.dialog.open(BucketsModal, {
      width: '450px',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(_ => {
      this.getBuckets()
    })
  }

  openModalCost() {
    const dialogRef = this.dialog.open(EstimateCostModal, {
      width: '600px'
    })
  }
}
