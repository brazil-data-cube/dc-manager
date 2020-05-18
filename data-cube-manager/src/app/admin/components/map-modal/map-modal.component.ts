import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { MapData } from './map-model.interface';

@Component({
    selector: 'app-map-modal',
    templateUrl: './map-modal.component.html',
    styleUrls: ['./map-modal.component.scss']
})
export class MapModal {

    public bbox = ''

    /** pointer to reference map */
    public map: MapLeaflet;
    /** object with map settings */
    public options: MapOptions;

    constructor(
        private ref: ChangeDetectorRef,
        public dialogRef: MatDialogRef<MapModal>,
        @Inject(MAT_DIALOG_DATA) public data: MapData) {
        this.initializeVariables()
        this.bbox = data.bbox
        
        // TODO: update bbox in the map
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

    /**
    * event used when change Map
    */
    onMapReady(map: MapLeaflet) {
        this.map = map
        this.setDrawControl()
    }
}
