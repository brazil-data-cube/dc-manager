import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { CubeBuilderService } from "app/admin/pages/cube-builder.service";
import { closeLoading, showLoading } from "app/app.action";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AdminState } from "app/admin/admin.state";
import { Store } from "@ngrx/store";

@Component({
    selector: 'buckets-modal',
    templateUrl: 'buckets.component.html',
    styleUrls: ['./buckets.component.scss']
})
export class BucketsModal {

    public formBucketCreate: FormGroup

    constructor(
        private store: Store<AdminState>,
        private cbs: CubeBuilderService,
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<BucketsModal>) {
            this.formBucketCreate = this.fb.group({
                name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]*$')]],
                requester: [true, [Validators.required]]
            });
        }

    reset() {
        this.formBucketCreate.setValue({ name: '', requester: true })
    }

    close(): void {
        this.reset()
        this.dialogRef.close()
    }

    async create() {
        if (this.formBucketCreate.status !== 'VALID') {
            this.snackBar.open('Fill in all fields correctly', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });

        } else {
            try {
                this.store.dispatch(showLoading())
                const newSchema = {
                    name: this.formBucketCreate.get('name').value,
                    requester_pay: this.formBucketCreate.get('requester').value
                }

                const response = await this.cbs.createBucket(newSchema)
                this.close()
                this.snackBar.open('Bucket created with successfully', '', {
                    duration: 4000,
                    verticalPosition: 'top',
                    panelClass: 'app_snack-bar-success'
                })

            } catch (err) {
                this.snackBar.open(err.error.toString(), '', {
                    duration: 4000,
                    verticalPosition: 'top',
                    panelClass: 'app_snack-bar-error'
                });

            } finally {
                this.store.dispatch(closeLoading())
            }
        }
    }

}