import { Component, Inject, OnInit } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { STACService } from 'app/services/stac';
import { AdminState } from 'app/admin/admin.state';
import { Store } from '@ngrx/store';
import { DefaultUrlSerializer } from '@angular/router';
import { closeLoading, showLoading } from 'app/app.action';
import { getBands } from 'app/shared/helpers/stac';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


interface ISTACObject {
    url: string;
    collections: string[];
    selectedCollection: string;
}

enum DataType {
    UINT8 = 'uint8',
    INT16 = 'int16',
    UINT16 = 'uint16',
    INT32 = 'int32',
    UINT32 = 'uint32',
}

interface IBand {
    name: string;
    common_name: string;
    nodata: number;
    min_value: number;
    max_value: number;
    data_type: DataType
}


@Component({
  selector: 'app-bands-dialog',
  templateUrl: './bands-dialog.component.html',
  styleUrls: ['./bands-dialog.component.scss'],
})
export class BandsDialogComponent implements OnInit {
    public stac: ISTACObject = { url: null, collections: [], selectedCollection: null };
    public bands: IBand[] = [];
    public form: any;

    constructor(
        private snackBar: MatSnackBar,
        private ss: STACService,
        private store: Store<AdminState>,
        public dialogRef: MatDialogRef<BandsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
    }

    ngOnInit() {
        if (this.data.bands && this.data.bands.length > 0) {
            this.bands = this.data.bands
        } else {
            this.bands = [
                {
                    name: "B1",
                    common_name: "B1",
                    data_type: DataType.INT16,
                    max_value: 10000,
                    min_value: 0,
                    nodata: 0
                }
            ];
        }
    }

    private async submitImportForm() {
        if (!this.stac || !this.stac.url) {
            this.snackBar.open('Fill in all fields correctly', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });
            return;
        }

        const response = await this.ss.getCollectionInfo(this.stac.url, this.stac.selectedCollection);

        let [bands, ref] = getBands(response);

        if (bands.length === 0) {
            this.snackBar.open(`No bands found from ${this.stac.selectedCollection}`, '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });
            return;
        }

        const bandsImported: IBand[] = []

        for(let bandName of bands) {
            let band = null;
            if (Array.isArray(ref)) {
                band = ref.find(entry => entry.name === bandName);
            } else {
                band = ref[bandName];
            }

            if (band.hasOwnProperty('min'))
                band.min_value = band.min;
            if (band.hasOwnProperty('max'))
                band.max_value = band.max;

            bandsImported.push(band);
        }
        this.bands = bandsImported;

        this.snackBar.open(`${bands.length} bands were imported from ${this.stac.selectedCollection}`, '', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'app_snack-bar-success'
        });

    }

    async search() {
        if (!this.stac.url)
            return;

        const parsed = new URL(this.stac.url);
        const urlParser = new DefaultUrlSerializer().parse(this.stac.url);

        const url = this.stac.url.replace(parsed.search, '');
        let accessToken = null;
        if (urlParser.queryParams && urlParser.queryParams.access_token) {
            accessToken = urlParser.queryParams.access_token;
        }

        try {
            this.store.dispatch(showLoading())
            const response = await this.ss.getCollections(url, accessToken);
            this.stac.collections = response['collections'].map(collection => collection.id);
        } catch {
            this.snackBar.open(`Error while retrieving collections in ${this.stac.url}`, '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });
        } finally {
            this.store.dispatch(closeLoading())
        }
    }

    public remove(index: number) {
        this.bands.splice(index, 1);
    }

    public addBand() {
        const name = `B${this.bands.length + 1}`;
        this.bands.push({
            name,
            common_name: name,
            data_type: DataType.INT16,
            max_value: 10000,
            min_value: 0,
            nodata: 0
        })
    }

    close(): void {
        this.dialogRef.close(this.bands)
    }

}
