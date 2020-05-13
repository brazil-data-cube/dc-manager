import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from '../cube-builder.service';


@Component({
    selector: 'app-list-cubes',
    templateUrl: './list-cubes.component.html',
    styleUrls: ['./list-cubes.component.scss']
})
export class ListCubesComponent implements OnInit {
    public cubes;

    constructor(
        private cbs: CubeBuilderService,
        private store: Store<AppState>) { }

    ngOnInit() {
        this.cubes = [];
        this.getCubes();
    }

    async getCubes() {
        try {
            this.store.dispatch(showLoading());
            const response = await this.cbs.getCubes();
            this.cubes = response.map(c => {
                return { ...c, status: c.id.indexOf('S2_10_16D') >= 0 ? 'danger' : c.id.indexOf('S2_10_1M') < 0 ? 'success' : 'warning' }
            })

        } catch (err) {
            this.cubes = [];
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    public getCubeClass(cube) {
        return `card-header-${cube.status}`;
    }

}
