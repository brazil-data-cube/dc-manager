import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MapModal } from 'app/admin/components/map-modal/map-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


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
    };

    public pageEvent: PageEvent;
    public pageIndex = 0;

    public form: FormGroup;

    constructor(
        private cbs: CubeBuilderService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            bbox: [''],
            start: [''],
            end: [''],
        })

        this.route.paramMap.subscribe(async params => {
            if (params['params'].page)
                this.pageIndex = params['params']['page'];

            await this.getCubes(params['params']['cube']);

            // list items
            await this.listItems(params['params']['cube']);
        });
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

    getItemsByTile() {
        const result = {};

        for(let item of this.itemsResponse.items) {
            if (!result[item.tile_id]) {
                result[item.tile_id] = [];
            }

            result[item.tile_id].push(item);
        }

        return result;
    }

    search() {
        let { bbox, start, end } = this.form.value;

        if (start) {
            // TODO: Use library like moment to get formatted date
            start = start.toISOString().split('T')[0]
        }

        if (end) {
            end = end.toISOString().split('T')[0]
        }

        // Always search for page 1
        this.listItems(this.cube.id, bbox, start, end, 1);
    }

    async getServerData(event: PageEvent) {
        this.listItems(this.cube.id, null, null, null, event.pageIndex + 1);
    }

    getTiles() {
        // Get all tiles in scenes
        const tiles = this.itemsResponse.items.map(item => item.tile_id);
        // Get unique tiles
        return tiles.filter((value, index, self) => self.indexOf(value) === index);
    }

    async listItems(cube: string, bbox?: string, start?: string, end?: string, page?: number) {
        try {
            this.store.dispatch(showLoading())
            const response = await this.cbs.listItems(cube, bbox, start, end, page);
            this.itemsResponse = response;
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
            this.form.patchValue({ bbox: result['bbox'] });
        })
    }

}
