import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { AdminState } from "app/admin/admin.state";
import { Store } from "@ngrx/store";
import { CubeBuilderService } from "app/admin/pages/cube-builder.service";
import { closeLoading, showLoading } from "app/app.action";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
    selector: 'temporal-composition-modal',
    templateUrl: 'temporal.component.html',
    styleUrls: ['./temporal.component.scss']
})
export class TemporalCompositionModal {

    public formTemporalCreate: FormGroup

    constructor(
        private store: Store<AdminState>,
        private cbs: CubeBuilderService,
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<TemporalCompositionModal>) {
        this.formTemporalCreate = this.fb.group({
            temporalSchema: ['', [Validators.required]],
            temporalCompositeT: [null, [Validators.required]],
            temporalCompositeUnit: ['', [Validators.required]]
        });
    }

    reset() {
        this.formTemporalCreate.setValue({
            temporalSchema: '',
            temporalCompositeT: null,
            temporalCompositeUnit: ''
        })
    }

    close(): void {
        this.reset()
        this.dialogRef.close()
    }

    async create() {
        if (this.formTemporalCreate.status !== 'VALID') {
            this.snackBar.open('Fill in all fields correctly', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });

        } else {
            try {
                this.store.dispatch(showLoading())
                const newSchema = {
                    temporal_schema: this.formTemporalCreate.get('temporalSchema').value,
                    temporal_composite_t: this.formTemporalCreate.get('temporalCompositeT').value.toString(),
                    temporal_composite_unit: this.formTemporalCreate.get('temporalCompositeUnit').value
                }

                const response = await this.cbs.createTemporalComposition(newSchema)
                this.close()
                this.snackBar.open('Created with successfully', '', {
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