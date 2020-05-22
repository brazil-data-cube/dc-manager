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
    public pageEvent: PageEvent
    public pageIndex = 0
    public perPage = 10
    public timeline: string[] = []
    public tiles: string[] = []
    public currentTab: string = ''
    public items = {} as any
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

    async onTabChanged(event) {
        const tile = this.tiles[event.index]
        this.currentTab = tile

        if (!this.items[tile]) {
            const items = await this.getAllItems(this.currentTab)
            const features = this.getAllFeatures(items)
            this.items[this.currentTab] = features
        }
    }

    async getCube(cubeName) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.getCubes(cubeName)
            this.cube = response;
            this.tiles = await this.cbs.listItemsTiles(cubeName) as any;
            this.currentTab = this.tiles[0];

            if (response.temporal.length !== 0) {
                if (!response.temporal_composition.schema) {
                    return;
                }
                const [start, end] = response.temporal;
                const { step, schema } = response.temporal_composition as any;
                this.timeline = await this.cbs.getTimeline(start, end, schema, step);
            }
        } catch (err) {
            this.router.navigate(['/list-cubes'])

        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    async search() {
        let { bbox, start, end } = this.form.value
        start = start ? moment(start).utc().format('YYYY-MM-DD') : ''
        end = end ? moment(end).utc().format('YYYY-MM-DD') : moment().utc().format('YYYY-MM-DD')

        // Always search for page 1
        const foundItems = await this.getAllItems(null, bbox, start, end)
        const tilesFound = foundItems.map(item => item.tile_id).filter((tile, index, self) => self.indexOf(tile) === index)

        this.tiles = tilesFound
        const allItemsExpected = this.getAllFeatures(foundItems)
        for(let tile of this.tiles) {
            this.items[tile] = allItemsExpected.filter(item => item.tile_id === tile && item.item_date >= start && item.item_date <= end)
        }
    }

    getAllFeatures(features) {
        if (this.timeline.length) {
            const dates = this.timeline.map(t => {
                return features.filter(f => f['item_date'] === t).length ? null : t;
            }).filter(t => t).map(t => { return { id: t, item_date: t, notFound: true, ...this.parseSceneID(features[0]['id']) } });
            return [...dates, ...features];
        }

        return features;
    }

    parseSceneID(sceneID) {
        const parts = sceneID.split('_');
        return {
            cube: parts.slice(0, 4).join('_'),
            tile_id: parts[4],
            startDate: parts[5],
            lastDate: parts[6]
        }
    }

    /** Retrieve all items from cube builder associated with cube context. */
    async getAllItems(tileId?: string, bbox?: string, start?: string, end?: string) {
        const result = await this.listItems(this.cube.id, bbox, null, null, this.pageIndex + 1, tileId);

        const total = result.total_items;
        let container = [...result.items];
        let pageRef = 1;

        while (container.length < total) {
            const res = await this.listItems(this.cube.id, bbox, null, null, ++pageRef, tileId);
            container = [...container, ...res.items];
        }

        return container;
    }

    async listItems(cube: string, bbox?: string, start?: string, end?: string, page?: number, tiles?: string) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.listItems(cube, bbox, start, end, tiles, page);
            return response;

        } catch (err) {
            throw err;
            
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
