import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { TemporalSchema } from "./temporalSchema.interface";

@Component({
    selector: 'temporal-composition-modal',
    templateUrl: './temporal.component.html',
    styleUrls: ['./temporal.component.scss']
})
export class TemporalCompositionModal {

    public formTemporalCreate: FormGroup

    constructor(
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<TemporalCompositionModal>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        const values = data['schema'] && data['schema'].length ? JSON.parse(data['schema']) : {}
        this.formTemporalCreate = this.fb.group({
            temporalSchema: [values['schema'] || 'cyclic', [Validators.required]],
            temporalCompositeStep: [values['step'] || null, [Validators.required]],
            temporalCompositeUnit: [values['unit'] || null, [Validators.required]],
            temporalCompositeIntervals: [values['intervals'] || null],
            temporalCompositeCyclicStep: [values['cyclic'] ? values['cyclic']['step'] : null],
            temporalCompositeCyclicUnit: [values['cyclic'] ? values['cyclic']['unit'] : null],
            temporalCompositeCyclicIntervals: [values['cyclic'] ? values['cyclic']['intervals'] : null]
        });
        
    }

    close(result): void {
        this.dialogRef.close(result)
    }

    async create() {
        if (this.formTemporalCreate.status !== 'VALID') {
            this.snackBar.open('Fill in all fields correctly', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });

        } else {
            let newSchema: TemporalSchema = {
                schema: this.formTemporalCreate.get('temporalSchema').value,
                step: this.formTemporalCreate.get('temporalCompositeStep').value,
                unit: this.formTemporalCreate.get('temporalCompositeUnit').value,
                intervals: this.formTemporalCreate.get('temporalCompositeIntervals').value
            }

            if (newSchema['schema'] === 'cyclic') {
                if (!this.formTemporalCreate.get('temporalCompositeCyclicStep').value ||
                    !this.formTemporalCreate.get('temporalCompositeCyclicUnit').value) {
                        this.snackBar.open('Cyclic Step and Unit is required!', '', {
                            duration: 4000,
                            verticalPosition: 'top',
                            panelClass: 'app_snack-bar-error'
                        });

                    } else {
                        newSchema = {
                            ...newSchema,
                            cycle: {
                                step: this.formTemporalCreate.get('temporalCompositeCyclicStep').value,
                                unit: this.formTemporalCreate.get('temporalCompositeCyclicUnit').value,
                                intervals: this.formTemporalCreate.get('temporalCompositeCyclicIntervals').value
                            }
                        }
                        this.close(JSON.stringify(newSchema))
                    }

            } else {
                this.close(JSON.stringify(newSchema))
            }

        }
    }

}