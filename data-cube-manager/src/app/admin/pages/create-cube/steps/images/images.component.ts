import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON, featureGroup, Layer, FeatureGroup, polygon } from 'leaflet';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { showLoading, closeLoading } from 'app/app.action';
import { Store, select } from '@ngrx/store';
import { AdminState } from 'app/admin/admin.state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STACService } from 'app/admin/pages/stac.service';
import { collectionsByVersion, getBands, totalItemsByVersion } from 'app/shared/helpers/stac';
import { formatDateUSA } from 'app/shared/helpers/date';
import { setBandsAvailable, setCollection, setRangeTemporal, setTiles, setUrlSTAC, setSatellite } from 'app/admin/admin.action';

import { intersect } from '@turf/turf';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  public satellites: string[]
  public formSearchImages: FormGroup
  public extraCatalogForm: FormGroup
  public stacVersion: string
  public grid: string
  public totalImages: number
  public tiles: string[]
  public tilesString: string
  public featuresSelected: any[]
  public isBigGrid = false
  public advancedSelected = false;
  public environmentVersion = window['__env'].environmentVersion;
  public extraCatalog = {};

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
      satellite: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      lastDate: ['', [Validators.required]]
    });
    this.extraCatalogForm = this.fb.group({
      'stac_url': ['', [Validators.required]],
      'collection': ['', [Validators.required]],
    })
  }

  ngOnInit() {
    this.initializeVariables()

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.grid && res.grid.infos && res.grid.infos.id !== this.grid) {
        this.grid = res.grid.infos.id
        this.isBigGrid = res.grid.large
        this.selectGrid(res.grid.infos.id)
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
    this.satellites = ['CBERS-4-MUX', 'CBERS-4-WFI', 'LANDSAT', 'MODIS', 'SENTINEL-2']
    this.totalImages = 0
    this.tiles = []
  }

  checkAdvancedOptions(event: MatCheckboxChange) {
    this.advancedSelected = event.checked;
    this.extraCatalogForm.patchValue({ 'stac_url': '', 'collection': '' })

    if (event.checked) {
      this.formSearchImages.addControl('extra_catalog', this.extraCatalogForm);
    } else {
      this.formSearchImages.removeControl('extra_catalog');
    }
  }

  /**
   * Return the layer tile identifier.
   *
   * @param layer Leaflet layer with BDC Grid tiles
   */
  private displayTileOnClick = (layer) => {
    return layer['feature'].geometry.properties.name;
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
      if (!this.isBigGrid) {
        let response = await this.cbs.getGrids(grid)
        const features = response['tiles'].map(t => {
          return { ...t['geom_wgs84'], id: t['id'], properties: {name: t['id']} }
        })
        const layer = geoJSON(features, {
          attribution: `BDC-${grid}`
        }).setStyle({
          fillOpacity: 0.1,
          fillColor:'blue'
        }).bindPopup(this.displayTileOnClick);

        this.map.addLayer(layer)
        this.map.fitBounds(layer.getBounds())
      }

    } catch (_) {
      this.grid = ''

    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  async getCollectionBySTAC() {
    const stacUrl = this.formSearchImages.get('urlSTAC').value;

    const response = await this.searchSTAC(stacUrl);

    this.stacVersion = response['stacVersion'];
    this.collections = response['collections'];
  }

  private async searchSTAC(stac_url: string) {
    let output = {};

    try {
      this.store.dispatch(showLoading());

      if (stac_url && stac_url !== '') {
        const respVersion = await this.ss.getVersion(stac_url)
        const stacVersion = respVersion['stac_version'].substring(0, 3)

        const response = await this.ss.getCollections(stac_url)
        output = {
          stacVersion: stacVersion,
          collections: collectionsByVersion(response, stacVersion)
        }
      }

    } catch (_) {
      this.snackBar.open(
        'Collections not found in this STAC! Please use STAC service in the following version: 0.6.x, 0.7.x, 0.8.x, 0.9.x',
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

    return output;
  }

  async searchExtraSTAC() {
    const stacUrl = this.extraCatalogForm.get('stac_url').value;

    const response = await this.searchSTAC(stacUrl);

    this.extraCatalog = response;
    this.extraCatalog['url'] = stacUrl;
  }

  async searchImages() {
    if (this.formSearchImages.status !== 'VALID') {
      this.snackBar.open('Fill in all fields correctly', '', {
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
        if ((!this.tiles || this.tiles.length === 0) && (!this.tilesString.length)) {
          this.snackBar.open('Select the region of interest in the grid or set tile_id in input', '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-error'
          });

        } else {

          try {
            this.store.dispatch(showLoading());

            const urlSTAC = this.formSearchImages.get('urlSTAC').value
            const collection = this.formSearchImages.get('collection').value
            const satellite = this.formSearchImages.get('satellite').value
            const startDate = this.formSearchImages.get('startDate').value
            const lastDate = this.formSearchImages.get('lastDate').value

            if (this.isBigGrid) {
              this.totalImages = null
              this.tiles = this.tilesString.split(',').map(t => t.trim());
              this.getBandsAndSaveinStore(collection, satellite, urlSTAC, startDate, lastDate, this.tiles);

              this.snackBar.open(`Collection is valid!`, '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-success'
              });

            } else {
              const featureCollection = featureGroup(this.featuresSelected);

              let query = {
                  datetime: `${formatDateUSA(startDate)}/${formatDateUSA(lastDate)}`,
                  limit: 1
              };

              let total = 0;

              for(let featureLayer of featureCollection.getLayers()) {
                query['intersects'] = featureLayer['feature']['geometry']

                const response = await this.ss.getItemsByCollection(urlSTAC, collection, query)
                total += totalItemsByVersion(response, this.stacVersion)
              }

              if (total === 0) {
                throw Error

              } else {
                this.totalImages = total

                if (this.advancedSelected) {
                  const extraStacUrl = this.formSearchImages.controls['extra_catalog'].get('stac_url').value;
                  const extraCollection = this.formSearchImages.controls['extra_catalog'].get('collection').value;
                  let extraCatalogTotal = 0;

                  for(let featureLayer of featureCollection.getLayers()) {
                    query['intersects'] = featureLayer['feature']['geometry']

                    const extraResponse = await this.ss.getItemsByCollection(extraStacUrl, extraCollection, query);
                    extraCatalogTotal += totalItemsByVersion(extraResponse, this.stacVersion)
                  }

                  this.extraCatalog['total'] = extraCatalogTotal;

                  total += extraCatalogTotal;
                }

                this.getBandsAndSaveinStore(collection, satellite, urlSTAC, startDate, lastDate, this.tiles)

                this.snackBar.open(`Found: ${total} images!`, '', {
                  duration: 4000,
                  verticalPosition: 'top',
                  panelClass: 'app_snack-bar-success'
                });
              }
            }

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

  async getBandsAndSaveinStore(collection, satellite, urlSTAC, startDate, lastDate, tiles) {
    try {
      const respCollection = await this.ss.getCollectionInfo(urlSTAC, collection)

      const bands = getBands(respCollection);

      this.store.dispatch(setBandsAvailable({ bands }));

      this.store.dispatch(setTiles({ tiles: this.tiles }))
      this.store.dispatch(setCollection({ collection }))
      this.store.dispatch(setSatellite({ satellite }))
      this.store.dispatch(setRangeTemporal({
        startDate: formatDateUSA(startDate),
        lastDate: formatDateUSA(lastDate)
      }))
      this.store.dispatch(setUrlSTAC({ url: urlSTAC }))

    } catch (_) {
      this.snackBar.open('Bands not found in STAC-Collection!', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
    } finally {
      this.store.dispatch(closeLoading());
    }

  }

  /**
   * set Draw control of the map
   */
  private setDrawControl() {
    let drawnItems = new FeatureGroup();
    this.map.addLayer(drawnItems);

    const drawControl = new Control.Draw({
      draw: {
        marker: false,
        circle: false,
        polyline: false,
        // polygon: false,
        circlemarker: false,
        polygon: {
          showArea: true,
          shapeOptions: {
            color: '#FFF'
          }
        }
      },
      edit: {
        featureGroup: drawnItems,
        remove: null
      }
    });
    this.map.addControl(drawControl);

    // remove style of grid tiles
    this.map.on(Draw.Event.DRAWSTART, e => {
      if (e['layerType'] == 'polygon') {
        return;
      }

      this.map.eachLayer(l => {
        if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
          const layer: any = l
          layer.setStyle({
            fillOpacity: 0.1,
            fillColor:'blue'
          })
        }
      })
    })

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      const layer = e.layer;
      const newLayer = layer.toGeoJSON();
      this.tiles = []
      this.featuresSelected = []

      this.map.eachLayer(l => {
        if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
          if (l['feature']) {
            const layer: any = l

            if (intersect(newLayer, layer['feature'])) {
              layer.setStyle({
                fillOpacity: 0.5,
                fillColor: '#FFFFFF'
              })
              this.featuresSelected.push(layer)
              this.tiles.push(layer['feature']['geometry']['id'])
            }
          }
        }
      })

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
