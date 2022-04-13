import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Control, Draw, Map as MapLeaflet, MapOptions, geoJSON, latLng, rectangle, tileLayer } from 'leaflet';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { showLoading, closeLoading } from 'app/app.action';
import { CubeBuilderService } from 'app/services/cube-builder';

@Component({
  selector: 'app-map-field',
  templateUrl: './map-field.component.html',
  styleUrls: ['./map-field.component.scss'],
})
export class MapFieldComponent implements OnInit {
    @Input()
    form?: FormGroup;

    map: MapLeaflet;
    options: MapOptions;
    bbox;

    @Input() grid: string;
    @Input() tiles: any[];

    constructor(
      private store: Store<AppState>,
      private service: CubeBuilderService,
      private ref: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
      this.initializeVariables();

      if (this.form) {
        this.form.addControl('tiles', new FormControl(''));
      }
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
    }

    /**
      * event used when change Map
      */
    onMapReady(map: MapLeaflet) {
        this.map = map
        this.setDrawControl()

        if (this.grid) {
            this.selectGrid(this.grid);
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

      // remove style of grid tiles
      this.map.on(Draw.Event.DRAWSTART, _ => {
        this.map.eachLayer(l => {
          if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
            const layer: any = l
            layer.setStyle({
              fillOpacity: 0.1,
              fillColor:'blue'
            })
          }
        });
      });

      // add bbox in the map
      this.map.on(Draw.Event.CREATED, e => {
        const layer = e.layer;
        const newLayer = rectangle(layer.getBounds())
        this.tiles = []

        this.map.eachLayer(l => {
          if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
            if (l['feature']) {
              const layer: any = l
              if (newLayer.getBounds().intersects(layer.getBounds())) {
                layer.setStyle({
                  fillOpacity: 0.5,
                  fillColor: '#FFFFFF'
                })
                this.tiles.push(layer['feature']['geometry']['id']);
              }
            }
          }
        })

        if (this.form) {
          this.form.patchValue({ tiles: this.tiles });
        }

        this.bbox = newLayer.getBounds().toBBoxString()
        this.ref.detectChanges()
      });
    }

    async selectGrid(grid) {
        try {
            this.store.dispatch(showLoading());

            this.map.eachLayer(l => {
                if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
                    this.map.removeLayer(l)
                }
            })

            const boundsView = this.map.getBounds();

            // plot grid in map
            const response = await this.service.getGrids(grid, boundsView.toBBoxString())
            const features = response['tiles'].map(t => {
                return { ...t['geom_wgs84'], id: t['id'] }
            })

            const layer = geoJSON(features, {
                attribution: `BDC-${grid}`
            }).setStyle({
                fillOpacity: 0.1,
                fillColor:'blue'
            })

            // When tile provided, just mark as selected.
            if (this.tiles && this.tiles.length > 0) {
              for(let tile of this.tiles) {
                for(let feature of layer.getLayers()) {
                  if (feature['feature']['geometry']['id'] === tile) {
                    (feature as any).setStyle({
                      fillOpacity: 0.5,
                      fillColor: '#FFFFFF'
                    });
                    break;
                  }
                }
              }
            }

            this.map.addLayer(layer)
            this.map.fitBounds(layer.getBounds())

        } catch (_) {
            this.grid = ''

        } finally {
            this.store.dispatch(closeLoading());
        }
    }
}
