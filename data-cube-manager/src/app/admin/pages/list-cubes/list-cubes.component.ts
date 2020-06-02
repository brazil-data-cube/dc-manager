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
                return { ...c, status: c.status.toLowerCase() === 'error' ? 'danger' : c.status }
            })

        } catch (err) {
            this.cubes = [];
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

    public getCubeClass(cube) {
        const result = {
            error: 'danger',
            pending: 'warning',
            finished: 'success'
        };

        return `card-header-${result[cube.status.toLowerCase()]}`;
    }

}
