import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
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
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      meridian: [null, [Validators.required]],
      degreesx: [{value: 1.5, disabled: true}, [Validators.required]],
      degreesy: [{value: 1, disabled: true}, [Validators.required]]
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
      name: '',
      description: '',
      meridian: null,
      degreesx: 1.5,
      degreesy: 1
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
      const response = await this.cbs.getGrids(grid.id)
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
      this.store.dispatch(setGrid({ grid: grid.id }))

    } catch (err) {
      this.snackBar.open('Error when selecting the grid', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });

    } finally {
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
    const parts = bbox.split(',')
    return `${parts[0]},${parts[3]},${parts[2]},${parts[1]}`
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
        if (l['options'].className === 'previewBbox') {
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
