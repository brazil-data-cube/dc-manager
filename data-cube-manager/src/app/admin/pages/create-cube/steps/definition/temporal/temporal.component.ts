import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { AdminState } from "app/admin/admin.state";
import { Store } from "@ngrx/store";
import { CubeBuilderService } from "app/admin/pages/cube-builder.service";
import { closeLoading, showLoading } from "app/app.action";
import { TemporalComposition } from "../definition.interface";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'temporal-composition-modal',
    templateUrl: 'temporal.component.html',
    styleUrls: ['./temporal.component.scss']
})
export class TemporalCompositionModal {

    public form: TemporalComposition

    constructor(
        private store: Store<AdminState>,
        private cbs: CubeBuilderService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TemporalCompositionModal>) { 
            this.reset()
        }

    reset() {
        this.form = {
            id: null,
            temporal_schema: 'A',
            temporal_composite_t: null,
            temporal_composite_unit: ''
        }
    }

    close(): void {
        this.reset()
        this.dialogRef.close()
    }

    async create() {
        try {
            this.store.dispatch(showLoading())
            const newSchema = {
                ...this.form,
                temporal_composite_t: this.form.temporal_composite_t.toString()
            }
            delete newSchema['id']

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