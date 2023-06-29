import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { CubeBuilderService } from 'app/services/cube-builder';
import { Grid } from './grid.interface';
import { AdminState } from 'app/admin/admin.state';
import { Store } from '@ngrx/store';
import { setGrid } from 'app/admin/admin.action';
import { showLoading, closeLoading } from 'app/app.action';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as L from 'leaflet';
import 'assets/plugins/Leaflet.Coordinates/Leaflet.Coordinates-0.1.5.min.js';

@Component({
  selector: 'app-create-cube-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class CreateCubeGridComponent implements OnInit {

  /** pointer to reference map */
  public map: MapLeaflet;
  /** object with map settings */
  public options: MapOptions;

  public grids = [];
  public isBigGrid = false;
  public action = 'select';
  public bbox = ''
  public grid: Grid;
  public formCreateGrid: FormGroup;

  constructor(
    private cbs: CubeBuilderService,
    private store: Store<AdminState>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef) {
    this.formCreateGrid = this.fb.group({
      names: ['', [Validators.required]],
      description: ['', [Validators.required]],
      meridian: [null, [Validators.required]],
      shape: [null, [Validators.required]],
      tile_factor: [null, [Validators.required]],
      srid: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.initializeVariables()
    this.getGrids()
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
    this.grid = {
      id: '',
      description: '',
      crs: ''
    }
    this.formCreateGrid.setValue({
      names: '',
      description: '',
      meridian: null,
      shape: null,
      tile_factor: null,
      srid: null,
    })
  }

  async getGrids() {
    try {
      const response = await this.cbs.getGrids()
      this.grids = response.filter(g => g.crs)

    } catch (err) {
      this.grids = []
    }
  }

  async selectGrid(grid) {
    try {
      this.store.dispatch(showLoading())
      this.removeGrid(this.grid.id)

      // plot grid in map
      this.grid = grid;
      let response = await this.cbs.getGrids(grid.id, this.map.getBounds().toBBoxString())
      if (response['tiles'].length > 5000) {
        this.isBigGrid = true
        response = null

      } else {
        this.isBigGrid = false

        const features = response['tiles'].map(t => {
          return { ...t['geom_wgs84'], id: t['id'] }
        })
        const layer = geoJSON(features, {
          attribution: `BDC-${grid.id}`
        }).setStyle({
          fillOpacity: 0.1
        })
        this.map.addLayer(layer)
        this.bbox = layer.getBounds().toBBoxString()
        this.map.fitBounds(layer.getBounds())
      }

    } catch (err) {
      this.snackBar.open('Error when selecting the grid', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(setGrid({ grid: { infos: this.grid, large: this.isBigGrid } }))
      this.store.dispatch(closeLoading())
    }
  }

  removeGrid(grid) {
    this.map.eachLayer(l => {
      if (l.getAttribution() === `BDC-${grid}`) {
        this.map.removeLayer(l)
      }
    })
    this.initializeVariables()
    this.ref.detectChanges()
  }

  async createGrid() {
    try {
      if (this.formCreateGrid.status !== 'VALID') {
        this.snackBar.open('Fill in all fields correctly!', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
        });

      } else {
        if (this.bbox !== '') {
          this.store.dispatch(showLoading())
          const data = {
            ...this.formCreateGrid.value,
            projection: 'aea',
            bbox: this.formatBBox(this.bbox)
          }
          // Transform into list
          data['tile_factor'] = [data['tile_factor']]
          data['names'] = data['names'].split(',');
          data['shape'] = data['shape'].split(',').map(value => parseInt(value))

          if (data['tile_factor'][0].includes(';')) {
            data['tile_factor'] = data['tile_factor'][0].split(';')
          }

          let tileFactorList = [];
          for (let tileFactor of data['tile_factor']) {
            const [pixelX, pixelY] = tileFactor.split(',')
            tileFactorList.push([parseInt(pixelX), parseInt(pixelY)]);
          }

          if (tileFactorList.length !== data['names'].length) {
            this.snackBar.open(`The grids ${data['names']} not match with ${tileFactorList}. It must have same dimension.`, '', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: 'app_snack-bar-error'
            });
            return;
          }

          if (tileFactorList.length > 0) {
            data['tile_factor'] = tileFactorList;
          }

          const response = await this.cbs.createGrid(data)
          this.action = 'select'
          this.getGrids()

          this.snackBar.open('Grid created with successfully', '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-success'
          });

        } else {
          this.snackBar.open('Select region in the map to create a new grid', '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-error'
          });
        }
      }

    } catch (err) {
      this.snackBar.open('Error when creating the grid', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
      this.store.dispatch(closeLoading())
    }
  }

  private formatBBox(bbox) {
    return bbox.split(',').map(value => parseFloat(value));
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
    })
    this.map.addControl(drawControl)

    // remove last bbox
    this.map.on(Draw.Event.DRAWSTART, _ => {
      this.map.eachLayer(l => {
        if ((l['options'] as any).className === 'previewBbox') {
          this.map.removeLayer(l);
        }
      })
    })

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      const layer: any = e['layer']
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
   * set Coordinates options in the map
   */
  private setCoordinatesControl() {
    (L.control as any).coordinates({
      position: 'bottomleft',
      decimals: 0,
      decimalSeperator: '.',
      labelTemplateLat: '',
      labelTemplateLng: 'MEDIRIAN: {x}',
      enableUserInput: false,
      useDMS: false,
      useLatLngOrder: true,
    }).addTo(this.map);
  }

  /**
  * event used when change Map
  */
  onMapReady(map: MapLeaflet) {
    this.map = map
    this.setDrawControl()
    this.setCoordinatesControl()
  }
}
