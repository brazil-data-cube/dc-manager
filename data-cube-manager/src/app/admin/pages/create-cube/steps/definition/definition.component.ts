import { Component, OnInit } from '@angular/core'
import { Store, select } from '@ngrx/store'
import { MatDialog } from '@angular/material/dialog'

import { showLoading, closeLoading } from 'app/app.action'
import { AdminState } from 'app/admin/admin.state'
import { TemporalComposition, CompositeFunction } from './definition.interface'
import { TemporalCompositionModal } from './temporal/temporal.component'
import { CubeBuilderService } from 'app/services/cube-builder'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EstimateCostModal } from './estimate-cost/estimate-cost.component'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { setBandsAvailable, setCustomBands, setDefinition } from 'app/admin/admin.action'
import { BucketsModal } from './buckets/buckets.component'
import { CustomBandDialogComponent } from './custom-band-dialog/custom-band-dialog.component'
import { getCubeBuilderVersion } from 'app/shared/helpers/cube'
import { BandsDialogComponent } from 'app/admin/components/bands-dialog/bands-dialog.component'

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
  public customBands: any = [];
  public localDataSource: any = null;

  public wellKnownIndexes = {
    'NDVI': '10000. * ((NIR_BAND_HERE - RED_BAND_HERE) / (NIR_BAND_HERE + RED_BAND_HERE))',
    'EVI': '10000. * 2.5 * (NIR_BAND_HERE - RED_BAND_HERE) / (NIR_BAND_HERE + 6. * RED_BAND_HERE - 7.5 * BLUE_BAND_HERE + 10000)',
    'CUSTOM': 'B1 / B2'
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
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-_]*$')]],
      identity: ['', this.supportsIdentityField() ?
        [Validators.required, Validators.pattern('^[a-zA-Z0-9-_]*$')] :
        []
      ],
      version: ['', [Validators.required]],
      resolution: ['', [Validators.required]],
      temporalComposite: [{value: '', disabled: true}, [Validators.required]],
      compositeFunction: [null, [Validators.required]],
      bands: [[''], [Validators.required]],
      nodata: ['', [Validators.required, Validators.min(-32768), , Validators.max(32767)]],
      quicklookR: ['', [Validators.required]],
      quicklookG: ['', [Validators.required]],
      quicklookB: ['', [Validators.required]],
      indexes: [['']],
      qualityBand: ['', []],
      qualityNodata: ['', [Validators.min(-32768), , Validators.max(32767)]],
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
      if (res.localDataSource) {
        this.localDataSource = res.localDataSource;
      }
    })
  }

  public addIndexMetaGroup(value, bands) {
    const group = this.fb.group({
      bands: [[''], []],
      value: [[value || ''], []],
      nodata: [-9999, []]
    })
    group.controls.bands.setValue(bands);

    return group;
  }

  public onChangeBandIndex(event) {
    const { value } = event;

    for(let indexValue of value) {
      let expression = this.wellKnownIndexes[indexValue];

      if (expression === undefined) {
        continue
      }

      let redBand = '';
      let nirBand = '';
      let blueBand = '';

      if (this.satellite.startsWith('SENTINEL')) {
        // TODO: Show error when no required band selected
        nirBand = 'B8A';
        redBand = 'B04';
        blueBand = 'B02';
      } else if (this.satellite === 'LANDSAT') {
        nirBand = 'SR_B7';
        redBand = 'SR_B4';
        blueBand = 'SR_B2';
      } else if (this.satellite === 'CBERS') {
        nirBand = 'BAND16';
        redBand = 'BAND15';
        blueBand = 'BAND13';
      }
      let bands = [nirBand, redBand];
      if (indexValue === 'EVI') {
        bands = [nirBand, redBand, blueBand]
      }

      expression = expression.replaceAll('NIR_BAND_HERE', nirBand)
                             .replaceAll('RED_BAND_HERE', redBand)
                             .replaceAll('BLUE_BAND_HERE', blueBand);

      if (!this.formCreateCube.get('indexesMeta').get(indexValue)) {
        (this.formCreateCube.get('indexesMeta') as any).controls[indexValue] = this.addIndexMetaGroup(expression, bands)
      }
    }
  }

  addCustomIndex() {
    const dialogRef = this.dialog.open(CustomBandDialogComponent, {
      width: '250px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (!this.indexesAvailable.includes(result)) {
          this.indexesAvailable.push(result);
          this.wellKnownIndexes[result] = 'B1 / B2'
        }
      }

    });
  }

  ngOnInit() {
    this.definitonCompleted = false
    this.getCompositeFunctions()
    if (this.environmentVersion === 'cloud') {
      this.getBuckets();
    }
    this.getIndexesAvailable();
  }

  async getCompositeFunctions() {
    try {
      this.store.dispatch(showLoading());
      const response = await this.cbs.getCompositeFunctions();
      this.compositeFunctions = response;

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

  private isString(value) {
    return typeof value === 'string' || value instanceof String;
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
        if (bandIndexName) {
          const indexFormValue = this.formCreateCube.get('indexesMeta').get(bandIndexName).value;
          let bandIndex = {
            name: bandIndexName,
            common_name: bandIndexName,
            data_type: 'int16',
            nodata: indexFormValue['nodata'],
            metadata: {
              expression: this.isString(indexFormValue) ? indexFormValue : indexFormValue[0]
            }
          };

          indexes.push(bandIndex);
        }
      }
      const data = {
        definition: {
          bucket: this.formCreateCube.get('bucket').value,
          name: this.formCreateCube.get('name').value,
          version: this.formCreateCube.get('version').value,
          resolution: this.formCreateCube.get('resolution').value,
          temporal: this.formCreateCube.get('temporalComposite').value,
          function: this.formCreateCube.get('compositeFunction').value,
          bands: this.formCreateCube.get('bands').value,
          nodata: this.formCreateCube.get('nodata').value,
          bandsQuicklook: this.getBandsQuicklook(),
          indexes: indexes,
          qualityBand: this.formCreateCube.get('qualityBand').value,
          qualityNodata: this.formCreateCube.get('qualityNodata').value,
          public: this.formCreateCube.get('public').value
        }
      }
      if (this.supportsIdentityField()) {
        data.definition['identity'] = this.formCreateCube.get('identity').value;
      }

      this.store.dispatch(setDefinition(data))

      if (this.localDataSource) {
        this.store.dispatch(setCustomBands(this.customBands));
      }

      this.definitonCompleted = true
    }
  }

  getCubeFullName() {
    const name = this.formCreateCube.get('name').value
    if (this.formCreateCube.get('temporalComposite').value.length) {
      const temporalComposite = JSON.parse(this.formCreateCube.get('temporalComposite').value)
      const unit = temporalComposite['unit'].replace('day', 'D').replace('month', 'M').replace('year', 'Y')
      if (unit !== 'null') {
        return `${name}-${temporalComposite['step']}${unit}`
      }
    }
    return name;
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

  onCompositeFunctionChange(event) {
    const selectedFunction = event.value
    if (!!selectedFunction) {
      const controlBand = this.formCreateCube.controls['qualityBand']
      const controlBandNodata = this.formCreateCube.controls['qualityBand']
      if (selectedFunction.alias !== 'IDT') {
        controlBand.setValidators([Validators.required]);
        controlBandNodata.setValidators([Validators.required]);
      } else {
        controlBand.clearValidators();
        controlBandNodata.clearValidators();
        controlBand.setValue(null);
        controlBandNodata.setValue(null)
      }
    }
  }

  supportsIdentityField(): boolean {
    const builderVersion = getCubeBuilderVersion();
    if (!builderVersion || this.environmentVersion === 'cloud')
      return false;

    let [major, minor, patch] = builderVersion.split(".").map(value => Number.parseInt(value));

    // Supported only >= 0.8.3
    return (major == 0 && minor >= 8 && patch >= 3) ||
           (major >= 1 && minor >= 0 && patch >= 0);
  }

  openBandModal() {
    const dialogRef = this.dialog.open(BandsDialogComponent, {
      width: '800px',
      height: '600px',
      data: {
        bands: this.customBands
      }
    })

    dialogRef.afterClosed().subscribe(bands => {
      if (bands) {
        const bandNames = bands.map(band => band.name);
        this.store.dispatch(setBandsAvailable({ bands: bandNames }));

        this.formCreateCube.controls['bands'].setValue(bandNames);
        // Keep custom band definition
        this.customBands = bands;
      }
    })
  }
}
