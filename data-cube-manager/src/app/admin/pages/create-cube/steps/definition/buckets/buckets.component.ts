import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { CubeBuilderService } from "app/admin/pages/cube-builder.service";
import { closeLoading, showLoading } from "app/app.action";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'buckets-modal',
    templateUrl: 'buckets.component.html',
    styleUrls: ['./buckets.component.scss']
})
export class BucketsModal {

    public form: object

    constructor(
        private cbs: CubeBuilderService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<BucketsModal>) { 
            this.reset()
        }

    reset() {
    }

    close(): void {
        this.reset()
        this.dialogRef.close()
    }

}