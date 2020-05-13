import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, geoJSON } from 'leaflet';

@Component({
    selector: 'app-details-cube',
    templateUrl: './details-cube.component.html',
    styleUrls: ['./details-cube.component.scss']
})
export class DetailsCubeComponent implements OnInit {

    public cube;

    /** pointer to reference map */
    public map: MapLeaflet;
    /** object with map settings */
    public options: MapOptions;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.getCubes(params['params']['cube']);
        });

        this.options = {
            zoom: 4,
            layers: [
                tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                })
            ],
            center: latLng(-16, -52)
        };
    }

    async getCubes(cubeName) {
        try {
            this.store.dispatch(showLoading());
            const response = await this.cbs.getCubes(cubeName);
            this.cube = { ...response, finished: response.id.indexOf('S2_10_') < 0 }

        } catch (err) {
            console.log(err);

        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    async getGeoJSON(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getGeoJSON(cubeName)
            const layer = geoJSON(response).setStyle({
                fillOpacity: 0.1
            })
            this.map.addLayer(layer);
            this.map.fitBounds(layer.getBounds());
            // this.map.setZoom(this.map.getZoom() - 1);

        } catch (err) {
            console.log(err);

        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    /**
     * event used when change Map
     */
    onMapReady(map: MapLeaflet) {
        this.map = map;
        this.getGeoJSON(this.cube.id);
    }

}
