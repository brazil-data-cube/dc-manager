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
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
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
  public indexesAvailable: string[]
  public definitonCompleted: boolean
  public satellite: string
  public rangeDates: string[]
  public tiles: string[]
  public grid: string

  public wellKnownIndexes = {
    'NDVI': '10000. * ((NIR_BAND_HERE - RED_BAND_HERE) / (NIR_BAND_HERE + RED_BAND_HERE))',
    'EVI': '10000. * 2.5 * (NIR_BAND_HERE - RED_BAND_HERE) / (NIR_BAND_HERE + 6. * RED_BAND_HERE - 7.5 * BLUE_BAND_HERE + 1.)'
  }

  public environmentVersion = window['__env'].environmentVersion

  constructor(
    private store: Store<AdminState>,
    private cbs: CubeBuilderService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog) {
    this.formCreateCube = this.fb.group({
      bucket: ['', this.environmentVersion === 'cloud' ? [Validators.required] : []],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')]],
      version: ['', [Validators.required]],
      resolution: ['', [Validators.required]],
      temporalComposite: [{value: '', disabled: true}, [Validators.required]],
      compositeFunction: [null, [Validators.required]],
      bands: [[''], [Validators.required]],
      quicklookR: ['', [Validators.required]],
      quicklookG: ['', [Validators.required]],
      quicklookB: ['', [Validators.required]],
      indexes: [['']],
      qualityBand: ['', [Validators.required]],
      public: [true, [Validators.required]],
      indexesMeta: this.fb.group({})
    });

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.bandsAvailable) {
        const bands = res.bandsAvailable
        this.bandsAvailable = bands
        if (this.formCreateCube.get('bands').value.length === 0) {
          this.formCreateCube.get('bands').setValue(bands)
        }
      }
      if (res.tiles && res.tiles.length > 0) {
        this.tiles = res.tiles
      }
      if (res.satellite) {
        this.satellite = res.satellite
      }
      if (res.startDate && res.lastDate) {
        this.rangeDates = [res.startDate, res.lastDate]
      }
      if (res.grid && res.grid !== '') {
        this.grid = res.grid
      }
    })
  }

  public addIndexMetaGroup(value) {
    return this.fb.group({
      bands: [[''], []],
      value: [[value || ''], []]
    })
  }

  public onChangeBandIndex(event) {
    const { value } = event;

    for(let indexValue of value) {
      const expression = this.wellKnownIndexes[indexValue];

      if (!this.formCreateCube.get('indexesMeta').get(indexValue)) {
        (this.formCreateCube.get('indexesMeta') as any).controls[indexValue] = this.addIndexMetaGroup(expression)
      }
    }
  }

  ngOnInit() {
    this.definitonCompleted = false
    this.getCompositeFunctions()
    if (this.environmentVersion === 'cloud') {
      this.getBuckets();
    }
    this.getIndexesAvailable()
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

  saveInfosInStore() {
    if (this.formCreateCube.status !== 'VALID') {
      this.snackBar.open('Fill in all fields correctly', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
    } else {
      let indexes = [];

      for(let bandIndexName of this.formCreateCube.get('indexes').value) {
        const indexFormValue = this.formCreateCube.get('indexesMeta').get(bandIndexName).value;
        let bandIndex = {
          name: bandIndexName,
          common_name: bandIndexName,  // TODO: get common name from stac
          data_type: 'int16',
          metadata: {
            expression: indexFormValue
          }
        };

        indexes.push(bandIndex);
      }

      this.store.dispatch(setDefinition({
        definition: {
          bucket: this.formCreateCube.get('bucket').value,
          name: this.formCreateCube.get('name').value,
          version: this.formCreateCube.get('version').value,
          resolution: this.formCreateCube.get('resolution').value,
          temporal: this.formCreateCube.get('temporalComposite').value,
          function: this.formCreateCube.get('compositeFunction').value,
          bands: this.formCreateCube.get('bands').value,
          bandsQuicklook: this.getBandsQuicklook(),
          indexes: indexes,
          qualityBand: this.formCreateCube.get('qualityBand').value,
          public: this.formCreateCube.get('public').value
        }
      }))
      this.definitonCompleted = true
    }
  }

  getCubeFullName() {
    const name = this.formCreateCube.get('name').value
    const resolution = this.formCreateCube.get('resolution').value
    if (this.formCreateCube.get('temporalComposite').value.length) {
      const temporalComposite = JSON.parse(this.formCreateCube.get('temporalComposite').value)
      const unit = temporalComposite['unit'].replace('day', 'D').replace('month', 'M').replace('year', 'Y')
      if (unit === 'null') {
        return `${name}_${resolution}`
      } else {
        return `${name}_${resolution}_${temporalComposite['step']}${unit}`
      }
    } else {
      return `${name}_${resolution}`
    }
  }

  getSelectedIndexes() {
    const indexes = this.formCreateCube.get('indexes').value;

    if (indexes.length === 1 && indexes[0] === "")
      return [];

    return indexes;
  }

  getBandsQuicklook() {
    const r = this.formCreateCube.get('quicklookR').value
    const g = this.formCreateCube.get('quicklookG').value
    const b = this.formCreateCube.get('quicklookB').value
    return [r, g, b]
  }

  openModalTemporal() {
    const dialogRef = this.dialog.open(TemporalCompositionModal, {
      width: '800px',
      data: {
        schema: this.formCreateCube.get('temporalComposite').value
      }
    })

    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.formCreateCube.get('temporalComposite').setValue(value)
      }
    })
  }

  getIndexesAvailable() {
    this.indexesAvailable = ['NDVI', 'EVI']
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

  async openModalCost() {
    try {
      this.store.dispatch(showLoading())
      const temporal_schema = this.temporalCompositions
        .filter(t => t.id === this.formCreateCube.get('temporalComposite').value)
      const data = {
        start_date: this.rangeDates[0],
        last_date: this.rangeDates[1],
        satellite: this.satellite,
        resolution: this.formCreateCube.get('resolution').value,
        grid: this.grid,
        quantity_bands: this.formCreateCube.get('bands').value.length,
        quantity_tiles: this.tiles.length,
        quantity_indexes: this.formCreateCube.get('indexes').value.length,
        t_schema: temporal_schema[0].temporal_schema,
        t_step: parseInt(temporal_schema[0].temporal_composite_t)
      }

      const response = await this.cbs.estimateCost(data)
      const dialogRef = this.dialog.open(EstimateCostModal, {
        width: '600px',
        data: {
          ...response
        }
      })

    } catch(_) {
      this.snackBar.open('It was not possible to calculate the cost, review the information!', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading())
    }
  }
}
