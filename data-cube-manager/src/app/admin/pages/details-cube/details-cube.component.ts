import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, geoJSON } from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-details-cube',
    templateUrl: './details-cube.component.html',
    styleUrls: ['./details-cube.component.scss']
})
export class DetailsCubeComponent implements OnInit {

    public cube;
    public cubeStatus;

    /** pointer to reference map */
    public map: MapLeaflet;
    /** object with map settings */
    public options: MapOptions;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private store: Store<AppState>) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.getCube(params['params']['cube'])
            this.getCubesStatus(params['params']['cube'])
        })

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

    async getCube(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getCubes(cubeName)
            this.cube = response

        } catch (err) {
            this.snackBar.open('Error when listing cube information', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });

        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    async getCubesStatus(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getCubeStatus(cubeName)
            this.cubeStatus = response

        } catch (err) {
            this.snackBar.open('Error when querying the cube status', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });

        } finally {
            this.store.dispatch(closeLoading())
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

        } catch (err) {
            return

        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    getTotalTasks (cubeStatus) {
        const notDone = cubeStatus.not_done || 0
        return cubeStatus.done + notDone
    }

    getPercentage (cubeStatus) {
        if (cubeStatus) {
            if (cubeStatus.finished) {
                return 100
            } else {
                const all = cubeStatus.done + cubeStatus.not_done
                return (cubeStatus.done * 100) / all
            }
        } else {
            return 0
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
