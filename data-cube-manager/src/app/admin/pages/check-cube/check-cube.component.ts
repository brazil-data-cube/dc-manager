import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer } from 'leaflet';
import { MapModal } from 'app/admin/components/map-modal/map-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-check-cube',
    templateUrl: './check-cube.component.html',
    styleUrls: ['./check-cube.component.scss']
})
export class CheckCubeComponent implements OnInit {
    public cube

    public bbox = ''

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.getCubes(params['params']['cube']);
        })
    }

    async getCubes(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getCubes(cubeName)
            this.cube = response

        } catch (err) {
            console.log(err)

        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    openMapModal() {
        const dialogRef = this.dialog.open(MapModal, {
            width: '600px',
            disableClose: true,
            data: {
                bbox: this.bbox
            }
        })

        dialogRef.afterClosed().subscribe(result => {
            this.bbox = result['bbox']
        })
    }

}
