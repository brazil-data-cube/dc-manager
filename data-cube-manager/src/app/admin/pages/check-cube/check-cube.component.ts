import { Component, OnInit, SecurityContext } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from 'app/services/cube-builder';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MapModal } from 'app/admin/components/map-modal/map-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SceneDetailsComponent } from './scene-details/scene-details.component';
import * as moment from 'moment';
import { ReprocessDialogComponent } from 'app/admin/components/reprocess-dialog/reprocess-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { isIdentity } from 'app/shared/helpers/cube';


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
    public timeline = []
    public tiles: string[] = []
    private tilesAvailable: string[] = [];
    public currentTab: string = ''
    public items = {} as any
    public form: FormGroup
    public hasErrorInTab: boolean = false;
    public itemBaseUrl = window['__env'].itemBaseUrl;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private router: Router,
        private sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            bbox: [''],
            start: [''],
            end: [''],
            tiles: [''],
        })

        this.route.paramMap.subscribe(async params => {
            await this.getCube(params['params']['cube'])
        })
    }

    async onTabChanged(event) {
        const tile = this.tiles[event.index]
        this.currentTab = tile

        if (!this.items[tile]) {
            this.pageIndex = 0
            const items = await this.getAllItems(this.currentTab)
            const features = this.getAllFeatures(items)
            this.items[this.currentTab] = features
        }
    }

    async getCube(cubeName) {
        try {
            this.store.dispatch(showLoading());
            const cubeId = cubeName.split(':')[1];

            this.cube = await this.cbs.getCubes(cubeId);

            this.tiles = (await this.cbs.listItemsTiles(cubeId) as any).sort();
            this.tilesAvailable = this.tiles;
            this.currentTab = this.tiles[0];

            if (this.cube.temporal_composition_schema) {
                const data = {
                    start_date: moment(this.cube.start_date).utc().format(),
                    last_date: moment(this.cube.end_date).utc().format(),
                    ...this.cube.temporal_composition_schema
                }
                const respTimeline = await this.cbs.getTimeline(data);
                this.timeline = respTimeline['timeline'];
            }

        } catch (err) {
            this.router.navigate(['/list-cubes'])

        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    async search() {
        let { bbox, start, end, tiles } = this.form.value

        start = start ? moment(start).utc().format('YYYY-MM-DD') : ''
        end = end ? moment(end).utc().format('YYYY-MM-DD') : moment().utc().format('YYYY-MM-DD')

        let calleeArguments = [null, null];

        if (bbox) {
            calleeArguments = [null, bbox];
        }

        if (tiles) {
            calleeArguments = [tiles, null];
        }

        calleeArguments.push(start, end);

        const foundItems = await this.getAllItems(...calleeArguments)
        const tilesFound = foundItems.map(item => item.tile_id).filter((tile, index, self) => self.indexOf(tile) === index)

        this.tiles = tilesFound.sort();

        if (tilesFound.length >= 1) {
            const allItemsExpected = this.getAllFeatures(foundItems)
            for(let tile of this.tiles) {
                this.items[tile] = allItemsExpected.filter(item => {
                    const item_date = moment(item.start_date).utc().format('YYYY-MM-DD')
                    return item.tile_id === tile && start <= item_date && item_date <= end
                });
            }
            this.onTabChanged({ index: 0 });
        }
    }

    getAllFeatures(features) {
        if (this.timeline.length) {
            const dates = this.timeline
                .map(t => {
                    return features.filter(f => f['start_date'].substring(0,10) === t[0]).length ? null : t;
                })
                .filter(t => t)
                .map(t => { return {
                    name: `${t[0]}_${t[1]}`,
                    start_date: t[0],
                    end_date: t[1],
                    notFound: true,
                    ...this.parseSceneID(features[0]['name']) } });

            this.hasErrorInTab = dates.length > 0;

            return [...dates, ...features];
        }
        this.hasErrorInTab = false;

        return features;
    }

    parseSceneID(sceneID) {
        const parts = sceneID.split('_');
        return {
            cube: parts.slice(0, 4).join('_'),
            version: parts[4],
            tile_id: parts[5],
            startDate: parts[6],
            lastDate: parts[7]
        }
    }

    /** Retrieve all items from cube builder associated with cube context. */
    async getAllItems(tileId?: string, bbox?: string, start?: string, end?: string) {
        const result = await this.listItems(this.cube.id, bbox, start, end, this.pageIndex + 1, tileId);

        return result.items;
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
        const qk = item.quicklook;

        if (qk) {
            const bucket = qk.split('/')[0];
            if (window['__env'].environmentVersion === 'cloud') {
                return `https://${bucket}.s3.amazonaws.com${qk.replace(bucket, '')}`;
            } else {
                if (qk.startsWith('/tmp/') || qk.startsWith('/e006/')) {
                    return `${this.itemBaseUrl}/dev${qk}`;
                } else {
                    return `${this.itemBaseUrl}${qk}`;
                }
            }
        }
        return '';
    }

    openMapModal() {
        const dialogRef = this.dialog.open(MapModal, {
            width: '600px',
            disableClose: true,
            data: {
                bbox: this.bbox,
                cube: this.cube,
                tiles: this.tilesAvailable
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result)
                this.form.patchValue({ bbox: result['bbox'] })
        })
    }

    async downloadErrors(tile) {
        try {
            this.store.dispatch(showLoading());
            const scenes: Set<string> = new Set<string>();
            for (let item of this.items[tile]) {
                if (item.notFound) {
                    const response = await this.cbs.listMerges(this.cube.id, item.start_date, item.end_date, tile);

                    for(let mergeDate of Object.keys(response)) {
                        const merge = response[mergeDate];
                        for (let error of merge['errors']) {
                            scenes.add(error['filename']);
                        }
                    }
                }
            }

            const link = document.createElement('a');
            const linkURL = this.exportJSONFile(Array.from(scenes));
            const res = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, linkURL);

            link.setAttribute('target', '_blank');
            link.setAttribute('href', res);
            link.setAttribute('download', 'scenes-errors.json');
            document.body.appendChild(link);
            link.click()
            link.remove();
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    private exportJSONFile(data) {
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' })

        return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }

    async openDetails(item: any) {
        try {
            this.store.dispatch(showLoading());

            const tileId = item.tile_id || this.currentTab;

            const cubeName = this.cube.name;
            let start = moment(item.start_date).format('YYYY-MM-DD');
            let end = moment(item.end_date).format('YYYY-MM-DD');

            if (cubeName.split('_').length === 2) {
                start = moment(start).startOf('month').format('YYYY-MM-DD');
                end = moment(start).endOf('month').format('YYYY-MM-DD');
            }

            const response = await this.cbs.listMerges(this.cube.id, start, end, tileId);
            const dialogRef = this.dialog.open(SceneDetailsComponent, {
                width: '600px',
                height: '90%',
                maxHeight: '700px',
                data: {
                    cube: this.cube.name,
                    merges: response,
                    itemDate: item.start_date,
                    tileId,
                    itemId: item.name
                }
            })
            dialogRef.afterClosed();
        } finally {
            this.store.dispatch(closeLoading());
        }

    }

    async reprocess(item) {
        try {
            this.store.dispatch(showLoading());
            const meta = await this.cbs.getCubeMeta(this.cube.id);

            const dialogRef = this.dialog.open(ReprocessDialogComponent, {
                width: '450px',
                disableClose: true,
                data: {
                    ...meta,
                    title: `Reprocess ${this.cube.name}`,
                    grid: this.cube.grid,
                    datacube: this.cube.name,
                    datacube_version: this.cube.version,
                    tiles: [this.currentTab],
                    editable: false,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    force: true
                }
            })
            dialogRef.afterClosed();
        } catch (err) {
            console.log('Error in getting information to reprocess.');
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    isIdentity() {
        return isIdentity(this.cube);
    }

}
