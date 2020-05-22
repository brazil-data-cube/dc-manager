import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MapModal } from 'app/admin/components/map-modal/map-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SceneDetailsComponent } from './scene-details/scene-details.component';
import * as moment from 'moment';
import { ReprocessDialogComponent } from './reprocess-dialog/reprocess-dialog.component';


@Component({
    selector: 'app-check-cube',
    templateUrl: './check-cube.component.html',
    styleUrls: ['./check-cube.component.scss']
})
export class CheckCubeComponent implements OnInit {
    
    public cube
    public bbox = ''
    public itemsResponse = {
        page: 1,
        items: [],
        total_items: 0
    }
    public pageEvent: PageEvent
    public pageIndex = 0

    public form: FormGroup

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private router: Router
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            bbox: [''],
            start: [''],
            end: [''],
        })

        this.route.paramMap.subscribe(async params => {
            if (params['params'].page) {
                this.pageIndex = params['params']['page']
            }
            await this.getCube(params['params']['cube'])
        })
    }

    async getCube(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getCubes(cubeName)
            this.cube = response
            this.listItems(cubeName)

        } catch (err) {
            this.router.navigate(['/list-cubes'])

        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    getItemsByTile() {
        const result = {}
        for(let item of this.itemsResponse.items) {
            if (!result[item.tile_id]) {
                result[item.tile_id] = []
            }
            result[item.tile_id].push(item)
        }
        return result
    }

    search() {
        let { bbox, start, end } = this.form.value
        if (start) {
            start = moment(start).utc().format('YYYY-MM-DD')
        }
        if (end) {
            end = moment(end).utc().format('YYYY-MM-DD')
        }
        // Always search for page 1
        this.listItems(this.cube.id, bbox, start, end, 1)
    }

    async getServerData(event: PageEvent) {
        this.listItems(this.cube.id, null, null, null, event.pageIndex + 1)
    }

    getTiles() {
        // Get all tiles in scenes
        const tiles = this.itemsResponse.items.map(item => item.tile_id)
        // Get unique tiles
        return tiles.filter((value, index, self) => self.indexOf(value) === index)
    }

    async listItems(cube: string, bbox?: string, start?: string, end?: string, page?: number) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.listItems(cube, bbox, start, end, page)
            this.itemsResponse = response

        } catch (err) {
            return
        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    getUrl(item) {
        const qk = item.quicklook
        const bucket = qk.split('/')[0]
        return `https://${bucket}.s3.amazonaws.com${qk.replace(bucket, '')}`
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
            this.form.patchValue({ bbox: result['bbox'] })
        })
    }

    async openDetails(item: any) {
        try {
            this.store.dispatch(showLoading());

            const cubeName = this.cube.id;
            let start = item.composite_start;
            let end = item.composite_end;

            if (cubeName.split('_').length === 2) {
                start = moment(start).startOf('month').format('YYYY-MM-DD');
                end = moment(start).endOf('month').format('YYYY-MM-DD');
            }

            const response = await this.cbs.listMerges(this.cube.id, start, end, item.tile_id);
            const dialogRef = this.dialog.open(SceneDetailsComponent, {
                width: '600px',
                height: '90%',
                maxHeight: '700px',
                data: {
                    cube: this.cube.id,
                    merges: response,
                    itemDate: item.item_date,
                    tileId: item.tile_id
                }
            })
            dialogRef.afterClosed();
        } finally {
            this.store.dispatch(closeLoading());
        }

    }

    async reprocess(item) {
        const dialogRef = this.dialog.open(ReprocessDialogComponent, {
            width: '450px',
            disableClose: true,
            data: {
                cube: this.cube.id,
                itemDate: item.item_date,
                tiles: [item.tile_id],
                editable: false,
                start_date: item.composite_start,
                end_date: item.composite_end
            }
        })
        dialogRef.afterClosed();
    }

}
