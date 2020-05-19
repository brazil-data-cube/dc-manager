import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { showLoading, closeLoading } from 'app/app.action';
import { Store, select } from '@ngrx/store';
import { AdminState } from 'app/admin/admin.state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STACService } from 'app/admin/pages/stac.service';
import { collectionsByVersion, totalItemsByVersion } from 'app/shared/helpers/stac';
import { version } from 'punycode';
import { formatDateUSA } from 'app/shared/helpers/date';

@Component({
  selector: 'app-create-cube-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  providers: [{
    provide: DateAdapter, useClass: AppDateAdapter
  },
  {
    provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
  }]
})
export class CreateCubeImagesComponent implements OnInit {

  /** pointer to reference map */
  public map: MapLeaflet
  /** object with map settings */
  public options: MapOptions

  public collections: string[]
  public formSearchImages: FormGroup
  public bbox: string
  public stacVersion: string
  public grid: string
  public totalImages: number = 0

  constructor(
    private cbs: CubeBuilderService,
    private ss: STACService,
    private store: Store<AdminState>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) {
    this.formSearchImages = this.fb.group({
      collection: ['', [Validators.required]],
      urlSTAC: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      lastDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.initializeVariables()

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.grid) {
        this.grid = res.grid
        this.selectGrid(res.grid)
      }
    })
  }

  initializeVariables() {
    this.options = {
      zoom: 4,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })
      ],
      center: latLng(-16, -52)
    }
    this.collections = []
  }

  async selectGrid(grid) {
    try {
      this.store.dispatch(showLoading());

      this.map.eachLayer(l => {
        if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
          this.map.removeLayer(l)
        }
      })

      // plot grid in map
      const response = await this.cbs.getGrids(grid)
      const features = response['tiles'].map(t => {
        return { ...t['geom_wgs84'], id: t['id'] }
      })
      const layer = geoJSON(features, {
        attribution: `BDC-${grid}`
      }).setStyle({
        fillOpacity: 0.1
      })
      this.map.addLayer(layer)
      this.map.fitBounds(layer.getBounds())

    } catch (_) {
      this.snackBar.open(`Grid ${grid} not found!`, '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  async getCollectionBySTAC() {
    try {
      this.store.dispatch(showLoading());
      const urlSTAC = this.formSearchImages.get('urlSTAC').value
      const respVersion = await this.ss.getVersion(urlSTAC)
      const stacVersion = respVersion['stac_version'].substring(0, 3)

      const response = await this.ss.getCollections(urlSTAC)
      this.stacVersion = stacVersion
      this.collections = collectionsByVersion(response, stacVersion)

    } catch (_) {
      this.snackBar.open(
        'Collections not found in this STAC! Please use STAC service in the following version: 0.6.x, 0.7.x, 0.8.x',
        '',
        {
          duration: 6000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        }
      );

    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  async searchImages() {
    if (this.formSearchImages.status !== 'VALID') {
      this.snackBar.open('Fill in all fields correctly!', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
    } else {
      if (!this.grid) {
        this.snackBar.open('Select a grid in before step (GRID)', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        });
      } else {
        if (!this.bbox) {
          this.snackBar.open('Select the region  interest on the map', '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-error'
          });
        } else {

          try {
            this.store.dispatch(showLoading());
            const urlSTAC = this.formSearchImages.get('urlSTAC').value
            const collection = this.formSearchImages.get('collection').value
            const startDate = this.formSearchImages.get('startDate').value
            const lastDate = this.formSearchImages.get('lastDate').value
            let query = `bbox=${this.stacVersion === '0.6' ? '['+this.bbox+']' : this.bbox}`
            query += `&time=${formatDateUSA(startDate)}/${formatDateUSA(lastDate)}`
            query += '&limit=1'

            // TODO: verify tiles in GRID that intersect with bbox and save no store
            // TODO: select bands by collection

            const response = await this.ss.getItemsByCollection(urlSTAC, collection, query)
            this.totalImages = totalItemsByVersion(response, this.stacVersion)

            this.snackBar.open(`Found: ${this.totalImages} images!`, '', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: 'app_snack-bar-success'
            });

          } catch (_) {
            this.snackBar.open('Images not found!', '', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: 'app_snack-bar-error'
            });
          } finally {
            this.store.dispatch(closeLoading());
          }

        }
      }
    }
  }

  /**
   * set Draw control of the map
   */
  private setDrawControl() {
    const drawControl = new Control.Draw({
      draw: {
        marker: false,
        circle: false,
        polyline: false,
        polygon: false,
        circlemarker: false,
        rectangle: {
          shapeOptions: {
            color: '#FFF'
          }
        }
      }
    });
    this.map.addControl(drawControl);

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      const layer: any = e['layer'];
      const newLayer = rectangle(layer.getBounds(), {
        color: '#FFF',
        weight: 3,
        fill: false,
        dashArray: '10',
        interactive: false,
        className: 'previewBbox'
      })

      this.map.addLayer(newLayer)
      this.bbox = newLayer.getBounds().toBBoxString()
      this.ref.detectChanges()
    });
  }

  /**
  * event used when change Map
  */
  onMapReady(map: MapLeaflet) {
    this.map = map
    this.setDrawControl()
  }
}
