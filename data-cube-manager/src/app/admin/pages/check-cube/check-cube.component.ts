import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer } from 'leaflet';

@Component({
    selector: 'app-check-cube',
    templateUrl: './check-cube.component.html',
    styleUrls: ['./check-cube.component.scss']
})
export class CheckCubeComponent implements OnInit {
    public cube;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.getCubes(params['params']['cube']);
        });
    }

    async getCubes(cubeName) {
        try {
            this.store.dispatch(showLoading());
            const response = await this.cbs.getCubes(cubeName);
            this.cube = response;

        } catch (err) {
            console.log(err);
            
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

}
