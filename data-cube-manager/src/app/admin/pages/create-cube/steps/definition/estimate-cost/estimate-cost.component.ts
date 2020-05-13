import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";

@Component({
    selector: 'estimate-cost-modal',
    templateUrl: 'estimate-cost.component.html',
    styleUrls: ['./estimate-cost.component.scss']
})
export class EstimateCostModal {

    constructor(
        public dialogRef: MatDialogRef<EstimateCostModal>) { }

    close(): void {
        this.dialogRef.close()
    }
}