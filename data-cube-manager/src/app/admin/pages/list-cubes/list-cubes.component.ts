import { Component, OnInit } from '@angular/core';
import { showLoading, closeLoading } from 'app/app.action';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { CubeBuilderService } from 'app/services/cube-builder';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-list-cubes',
    templateUrl: './list-cubes.component.html',
    styleUrls: ['./list-cubes.component.scss']
})
export class ListCubesComponent implements OnInit {
    public cubes;
    public form: FormGroup;
    public filterSupported: boolean = false;

    constructor(
        private cbs: CubeBuilderService,
        private store: Store<AppState>,
        private fb: FormBuilder) {}

    ngOnInit() {
        this.cubes = [];
        this.form = this.fb.group({
            cubeName: [''],
            collectionType: ['all'],
            isPublic: [true]
        })
        this.getCubes();
        this.cbs.getBuilderVersion()
            .then((version) => {
                const [major, minor, patch] = version.split(".");
                if (major && parseInt(major) > 0) {
                    this.filterSupported = true;
                }
            })
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
            danger: 'danger',
            pending: 'warning',
            finished: 'success'
        };

        return `card-header-${result[cube.status.toLowerCase()]}`;
    }

    public getCubeFullName(cube) {
        return `${cube.name}-${cube.version}:${cube.id}`
    }

    public async filterCubes() {
        let { cubeName, collectionType, isPublic } = this.form.value;

        try {
            this.store.dispatch(showLoading());
            const response = await this.cbs.getCubes(null, { collection_type: collectionType, public: isPublic, name: cubeName });
            this.cubes = response.map(c => {
                return { ...c, status: c.status.toLowerCase() === 'error' ? 'danger' : c.status }
            })

        } catch (err) {
            this.cubes = [];
        } finally {
            this.store.dispatch(closeLoading());
        }
    }

}
