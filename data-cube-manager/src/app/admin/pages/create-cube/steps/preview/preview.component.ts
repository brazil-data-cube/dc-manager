import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CubeBuilderService } from 'app/services/cube-builder';
import { Store, select } from '@ngrx/store';
import { AdminState, DataSourceLocal, DefinitionCube, MetadataCube } from 'app/admin/admin.state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { showLoading, closeLoading } from 'app/app.action';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-cube-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class CreateCubePreviewComponent implements OnInit {

  public formCreate: FormGroup
  public gridCompleted: boolean
  public regionCompleted: boolean
  public definitionCompleted: boolean
  public definition: DefinitionCube
  public metadata: MetadataCube
  public grid: string
  public tiles: string[]
  public stacList: string[]
  public satellite: string
  public rangeDates: string[]
  public cost = {}
  public cubeCreated = false
  public localDataSource: DataSourceLocal;
  public customBands: any;

  public environmentVersion = window['__env'].environmentVersion

  constructor(
    private store: Store<AdminState>,
    private cbs: CubeBuilderService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router) {
    this.formCreate = this.fb.group({
      agree: [false, Validators.requiredTrue]
    });

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.grid && res.grid && res.grid.infos) {
        this.grid = res.grid.infos.name
        this.gridCompleted = true
      }
      if (res.tiles && res.tiles.length > 0) {
        this.tiles = res.tiles
        this.regionCompleted = true
      }
      if (res.definitionInfos && res.definitionInfos.resolution) {
        this.definition = res.definitionInfos
        this.definitionCompleted = true
      }
      if (res.metadata) {
        this.metadata = res.metadata
      }
      if (res.stacList) {
        this.stacList = res.stacList
      }
      if (res.satellite) {
        this.satellite = res.satellite
      }
      if (res.startDate && res.lastDate) {
        this.rangeDates = [res.startDate, res.lastDate]
      }
      if (res.localDataSource) {
        this.localDataSource = res.localDataSource;
        this.regionCompleted = true;
      }
      if (res.customBands) {
        this.customBands = res.customBands;
      }
    })
  }

  ngOnInit() {
    this.gridCompleted = false
    this.regionCompleted = false
    this.definitionCompleted = false
  }

  getCubeName(func) {
    return this.definition.name
  }

  getComplementCubeName(temporalSchema) {
    const temporalComposite = JSON.parse(temporalSchema)
    const unit = temporalComposite['unit'].replace('day', 'D').replace('month', 'M').replace('year', 'Y')
    return `${this.definition.resolution}_${temporalComposite['step']}${unit}`
  }

  async create() {
    if (this.formCreate.status !== 'VALID') {
      this.snackBar.open('Accept the terms of use', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } else {
      try {
        this.store.dispatch(showLoading());
        const title = this.metadata['title']

        let parameters = this.metadata['parameters']
        if (this.environmentVersion === 'cloud') {
          parameters = {
            ...parameters,
            stac_list: this.stacList.map(s => {
              const infos = {
                url: s['url'],
                collection: s['collection']
              }
              if (s['token']) {
                infos['token'] = s['token']
              }
              return infos
            })
          }
        }

        let bands = [];
        if (!!this.customBands && this.customBands.length > 0) {
          bands = this.customBands.map(band => ({
            name: band.name,
            common_name: band.common_name,
            data_type: band.data_type,
            nodata: band.nodata
          }))
        } else {
          bands = this.definition.bands.map(b => {
            return {
              'name': b,
              'common_name': b,
              'data_type': b !== this.definition.qualityBand ? 'int16' : 'uint8',
              'nodata': b !== this.definition.qualityBand ? this.definition.nodata : this.definition.qualityNodata
            }
          })
        }

        // CREATE CUBES METADATA
        const cube = {
          datacube: this.definition.name,
          title: title,
          grs: this.grid,
          version: this.definition.version,
          public: this.definition.public,
          resolution: this.definition.resolution,
          temporal_composition: JSON.parse(this.definition.temporal),
          composite_function: this.definition.function['alias'],
          bands,
          bands_quicklook: this.definition.bandsQuicklook,
          indexes: this.definition.indexes,
          metadata: {license: this.metadata['license'], platform: { code: this.metadata['satellite'], instruments: this.metadata['instruments'] }},
          description: this.metadata['description'],
          parameters: parameters
        }

        if (this.definition.identity !== '') {
          cube['datacube_identity'] = this.definition.identity
        }

        if (this.environmentVersion === 'cloud')
          cube['bucket'] = this.definition.bucket

        if (cube.composite_function !== 'IDT') {
          cube['quality_band'] = this.definition.qualityBand
        }
        // For Cubes Without any Quality Band (IDT) remove any entry related Mask
        if (!cube.hasOwnProperty('quality_band') && cube['parameters'].hasOwnProperty('mask')) {
          delete cube['parameters']['mask'];
        }

        const respCube = await this.cbs.create(cube)

        this.cubeCreated = true;
        this.snackBar.open('Cube metadata created with successfully', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-success'
        });

      } catch (error) {
        let errorMessage = 'Error creating cube '
        if (error && error.response) {
          let resp = error.response
          if (resp.status === 400) {
            if (resp.data.hasOwnProperty('_schema')) {
              for (let msg of resp.data['_schema']) {
                errorMessage += msg;
              }
            } else {
              for (let key of Object.keys(resp.data)) {
                const value = resp.data[key]
                errorMessage += `${key} - ${value}; `
              }
            }
          }
        }
        this.snackBar.open(errorMessage, '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        });

      } finally {
        this.store.dispatch(closeLoading());
      }
    }
  }

  async start() {
    try {
      this.store.dispatch(showLoading());

      // START CUBE CREATION
      let process = {
        bucket: this.definition.bucket,
        datacube_version: this.definition.version,
        tiles: this.tiles,
        start_date: this.rangeDates[0],
        end_date: this.rangeDates[1],
        force: false
      }

      if (this.environmentVersion === 'local') {
        delete process['bucket']
        delete process['datacube_version']

        if (this.localDataSource) {
          process = {
            ...process,
            ...this.localDataSource
          }
          delete this.localDataSource['type'];
        } else {
          let stacCollection = this.stacList[0]['collection'];
          if (!Array.isArray(stacCollection)) {
            stacCollection = stacCollection.split(',');
          }

          process['collections'] = stacCollection;
          process['stac_url'] = this.stacList[0]['url']
          process['token'] = this.stacList[0]['token']
        }

      }

      const compositeFunctions = [this.definition.function].filter(fn => fn['alias'] !== 'IDT').map(fn => fn['alias']);
      if (compositeFunctions.length !== 0) {
        process['datacube'] = `${this.definition.name}-${this.definition.version}`;
      } else {
        // Only IDENTITY selected
        process['datacube'] = `${this.definition.identity}-${this.definition.version}`
      }

      const respStart = await this.cbs.start(process)

      this.snackBar.open('Cube started with successfully', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-success'
      });
      this.router.navigate(['/list-cubes']);

    } catch (error) {
      const err = error && error.response ? error.response : 'Error starting cube'
      this.snackBar.open(err, '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  public getBandIndexes() {
    return this.definition.indexes.map(idx => idx.name).join(', ');
  }
}
