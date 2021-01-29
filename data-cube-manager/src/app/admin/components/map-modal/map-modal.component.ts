import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AdminState } from 'app/admin/admin.state';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { closeLoading, showLoading } from 'app/app.action';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { MapData } from './map-model.interface';

@Component({
    selector: 'app-map-modal',
    templateUrl: './map-modal.component.html',
    styleUrls: ['./map-modal.component.scss']
})
export class MapModal {

    public bbox = ''
    public cube = {}
    private availableTiles: string[] = [];

    /** pointer to reference map */
    public map: MapLeaflet;
    /** object with map settings */
    public options: MapOptions;

    constructor(
        private ref: ChangeDetectorRef,
        public dialogRef: MatDialogRef<MapModal>,
        private cbs: CubeBuilderService,
        private store: Store<AdminState>,
        @Inject(MAT_DIALOG_DATA) public data: MapData) {
        this.initializeVariables()
        this.bbox = data['bbox']
        this.cube = data['cube']
        this.availableTiles = data['tiles'] || [];
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

    close() {
        this.dialogRef.close()
    }

    save() {
        this.dialogRef.close({ bbox: this.bbox })
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

    async addGrid() {
        try {
            this.store.dispatch(showLoading())
            this.removeGrid(this.cube['grid_ref_sys_id'])

            // plot grid in map
            const response = await this.cbs.getGrids(this.cube['grid_ref_sys_id'])
            const features = response['tiles'].map(t => {
                return { ...t['geom_wgs84'], id: t['id'] }
            })

            const layer = geoJSON(features, {
                attribution: `BDC-${this.cube['grid_ref_sys_id']}`
            }).setStyle({
                fillOpacity: 0.1
            }).eachLayer(layer => {
                const tile = layer['feature']['geometry']['id'];

                if (this.availableTiles.includes(tile)) {
                    (layer as any).setStyle({
                        fillOpacity: 0.5,
                        fillColor: '#00ff00'
                    })
                }

                layer.bindPopup(tile);
            });

            this.map.addLayer(layer)
            this.map.fitBounds(layer.getBounds())

        } catch (err) {
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

    /**
    * event used when change Map
    */
    onMapReady(map: MapLeaflet) {
        this.map = map
        this.setDrawControl()
        this.addGrid()
    }
}
