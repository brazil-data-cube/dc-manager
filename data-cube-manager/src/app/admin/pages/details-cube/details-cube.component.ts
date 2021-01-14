import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, geoJSON } from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReprocessDialogComponent } from 'app/admin/components/reprocess-dialog/reprocess-dialog.component';
import { UpdateCubeDialog } from 'app/admin/components/update-cube-dialog/update-cube-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-details-cube',
    templateUrl: './details-cube.component.html',
    styleUrls: ['./details-cube.component.scss']
})
export class DetailsCubeComponent implements OnInit {

    public cube;
    public cubeStatus;

    public exportMetadataUrl;

    /** pointer to reference map */
    public map: MapLeaflet;
    /** object with map settings */
    public options: MapOptions;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private store: Store<AppState>,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.getCube(params['params']['cube'].split(':')[1])
            this.getCubesStatus(params['params']['cube'].split(':')[0])
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

            this.exportCubeMetadata()

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

    async getTiles() {
        try {
            return await this.cbs.listItemsTiles(this.cube.id);
        } catch {
            return [];
        }
    }

    async openModalUpdateCube() {
        try {
            this.store.dispatch(showLoading());

            const tiles = await this.getTiles();

            const meta = await this.cbs.getCubeMeta(this.cube.id);
            const dialogRef = this.dialog.open(ReprocessDialogComponent, {
                width: '600px',
                disableClose: true,
                data: {
                    ...meta,
                    title: `Update Cube ${this.cube.name}`,
                    grid: this.cube.grid,
                    datacube: this.cube.name,
                    tiles: tiles,
                    editable: true,
                    end_date: null,
                    force: false
                }
            })
            dialogRef.afterClosed();
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    exportCubeMetadata() {
        // Clone entire cube object
        let cloneCubeObject = JSON.parse(this.convertToString(this.cube));
        cloneCubeObject['metadata'] = cloneCubeObject._metadata;
        delete cloneCubeObject._metadata;

        this.removeProperty(cloneCubeObject, ['grid_ref_sys_id', 'composite_function_id'])

        for (let band of cloneCubeObject.bands) {
            this.removeProperty(band, ['_metadata', 'id', 'collection_id']);
        }

        const data = JSON.stringify(cloneCubeObject, null, 4);

        const uri = this.sanitizer.bypassSecurityTrustUrl(`data:text/json;charset=UTF-8,${encodeURIComponent(data)}`);
        this.exportMetadataUrl = uri;
    }

    openModalUpdateCubeMetadata() {
        const dialogRef = this.dialog.open(UpdateCubeDialog, {
            width: '800px',
            maxHeight: '85%',
            minHeight: '400px',
            disableClose: true,
            data: {
                cube: this.cube
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getCube(this.cube['id']);
            }
        });
    }

    private removeProperty(obj, keys) {
        for(let key of keys) {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }
    }

    public convertToString(obj) {
        return JSON.stringify(obj);
    }

    public getCubeFullName(cube) {
        return `${cube.name}-${cube.version}:${cube.id}`
    }

    /**
     * event used when change Map
     */
    onMapReady(map: MapLeaflet) {
        this.map = map;
        this.getGeoJSON(this.cube.id);
    }

}
