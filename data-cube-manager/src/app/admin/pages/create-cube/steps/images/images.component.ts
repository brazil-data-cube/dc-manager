import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON, featureGroup, Layer, FeatureGroup, polygon } from 'leaflet';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { showLoading, closeLoading } from 'app/app.action';
import { Store, select } from '@ngrx/store';
import { AdminState } from 'app/admin/admin.state';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STACService } from 'app/admin/pages/stac.service';
import { collectionsByVersion, getBands, totalItemsByVersion } from 'app/shared/helpers/stac';
import { formatDateUSA } from 'app/shared/helpers/date';
import { setBandsAvailable, setRangeTemporal, setTiles, setStacList, setSatellite } from 'app/admin/admin.action';

import { intersect } from '@turf/turf';
import * as L from 'leaflet';

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

  public satellites: string[]
  public formSearchImages: FormGroup
  public stacVersion: string
  public grid: string
  public totalImages: number
  public tiles: string[]
  public tilesString: string
  public featuresSelected: any[]
  public isBigGrid = false
  public stacList = [];

  public environmentVersion = window['__env'].environmentVersion;

  constructor(
    private cbs: CubeBuilderService,
    private ss: STACService,
    private store: Store<AdminState>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) {
    this.formSearchImages = this.fb.group({
      satellite: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      lastDate: ['', [Validators.required]]
    });
    this.tiles = [];
    this.featuresSelected = [];
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
    this.satellites = ['CBERS-4-MUX', 'CBERS-4-WFI', 'LANDSAT', 'MODIS', 'SENTINEL-2']
    this.tiles = []

    this.addStac()
  }

  addStac() {
    this.stacList = [...this.stacList]
    this.stacList.push({
      authentication: false,
      url: '',
      collection: '',
      token: '',
      totalImages: 0,
      collections: [],
      version: ''
    })
  }

  removeStac(stacIndice) {
    this.stacList.splice(stacIndice, 1);
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

  private async searchSTAC(stac_url: string, access_token = undefined) {
    let output = {};

    try {
      this.store.dispatch(showLoading());

      access_token = access_token ? { access_token } : {}

      if (stac_url && stac_url !== '') {
        const respVersion = await this.ss.getVersion(stac_url)
        const stacVersion = respVersion['stac_version'].substring(0, 3)

        const response = await this.ss.getCollections(stac_url, access_token)
        output = {
          stacVersion: stacVersion,
          collections: collectionsByVersion(response, stacVersion)
        }
      }

    } catch (_) {
      this.snackBar.open(
        'Collections not found in this STAC! Please use STAC service in the following version: 0.6.x, 0.7.x, 0.8.x, 0.9.x, 1.0.x',
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

  async getCollectionBySTAC(stacIndice) {
    let args: [string] = [this.stacList[stacIndice].url];

    if (this.stacList[stacIndice].authentication) {
      args.push(this.stacList[stacIndice].token);
    }

    const response = await this.searchSTAC(...args);

    this.stacList[stacIndice]['collections'] = response['collections'];
    this.stacList[stacIndice]['version'] = response['stacVersion'];
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

      } else if ((!this.tiles || this.tiles.length === 0) && (!this.tilesString)) {
        this.snackBar.open('Select the region of interest in the grid or set tile_id in input', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        });

      } else if (!this.stacList[0].url || !this.stacList[0].collection) {
        this.snackBar.open('Send STAC url and select one Collection', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        });

      } else {
        try {
          this.store.dispatch(showLoading());

          const satellite = this.formSearchImages.get('satellite').value
          const startDate = this.formSearchImages.get('startDate').value
          const lastDate = this.formSearchImages.get('lastDate').value

          let bands = [];

          for (let i = 0; i < this.stacList.length; i++) {
            let stac = this.stacList[i];

            if (stac.url && stac.collection) {
              let params = stac.authentication ? { access_token: stac.token } : {};

              if (this.isBigGrid) {
                stac.totalImages = null;
                this.tiles = this.tilesString.split(',').map(t => t.trim());

                const bandsByCollection = await this.getBandsAndSaveinStore(stac.collection, satellite, stac.url, startDate, lastDate, params);
                bands = [...bands, ...bandsByCollection]

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
                  query['intersects'] = featureLayer['feature']['geometry'];

                  const response = await this.ss.getItemsByCollection(stac.url, stac.collection, query, params);
                  total += totalItemsByVersion(response, stac.version);
                }

                this.stacList[i] = {...stac, totalImages: total};

                const bandsByCollection = await this.getBandsAndSaveinStore(stac.collection, satellite, stac.url, startDate, lastDate, params);
                bands = [...bands, ...bandsByCollection.filter(band => bands.indexOf(band) < 0)];
              }
            }
          }

          this.store.dispatch(setBandsAvailable({ bands }));
          this.store.dispatch(setStacList({
            stacList: this.stacList.filter(s => s.url && s.collection)
          }));

          const totalImagesFounded = this.stacList.map(s => s.totalImages).reduce((a, b) => a + b, 0);
          this.snackBar.open(`Found: ${totalImagesFounded} images!`, '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-success'
          });

        } catch (err) {
          console.log(err)
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

  async getBandsAndSaveinStore(collection, satellite, urlSTAC, startDate, lastDate, token) {
    try {
      const respCollection = await this.ss.getCollectionInfo(urlSTAC, collection, token)

      const bands = getBands(respCollection);

      this.store.dispatch(setTiles({ tiles: this.tiles }))
      this.store.dispatch(setSatellite({ satellite }))
      this.store.dispatch(setRangeTemporal({
        startDate: formatDateUSA(startDate),
        lastDate: formatDateUSA(lastDate)
      }));

      return bands

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
        remove: null,
        edit: false
      }
    });
    this.map.addControl(drawControl);

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      const layer = e.layer;
      const newLayer = layer.toGeoJSON();

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
    this.setClearSelectedFeaturesControl();
  }

  private setClearSelectedFeaturesControl() {
    const self = this;

    const controlType = L.Control.extend({
      options: {
        position: 'topleft',
        title: 'Clear Selected Features',
      },
      onAdd: function(map) {
        let container = L.DomUtil.create('div', 'leaflet-bar');
        let className = 'leaflet-control-clear-features';

        this._createButton(this.options.title, className, container, this._clearFeatures, this);

        return container;
      },
      _createButton(title, className, container, fn, context) {
        this.link = L.DomUtil.create('a', className, container);
        this.link.href = '#';
        this.link.title = title;

        const icon = L.DomUtil.create('span', 'material-icons', this.link);
        icon.append('delete');
        icon.style.fontSize = '20px';
        icon.style.color = '#404040';

        this.link.setAttribute('role', 'button');
        this.link.setAttribute('aria-label', title);

        L.DomEvent
          .addListener(this.link, 'click', L.DomEvent.stopPropagation)
          .addListener(this.link, 'click', L.DomEvent.preventDefault)
          .addListener(this.link, 'click', fn, context);

        return this.link;
      },
      _clearFeatures() {
        const map = this._map;

        for (let key of Object.keys(map._layers)) {
          const layer: any = map._layers[key];

          if (layer.hasOwnProperty('feature') && self.tiles.includes(layer.feature['geometry']['id'])) {
            layer.setStyle({
              fillOpacity: 0.1,
              fillColor:'blue'
            })
            const index = self.tiles.indexOf(layer.feature['geometry']['id']);
            self.tiles.splice(index, 1);
          }
        }
      }
    });

    const control = new controlType();
    control.addTo(this.map);
  }
}
