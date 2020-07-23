import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";

@Component({
    selector: 'estimate-cost-modal',
    templateUrl: 'estimate-cost.component.html',
    styleUrls: ['./estimate-cost.component.scss']
})
export class EstimateCostModal {

    public tasks = 0
    public items = 0
    public assets = 0
    public priceBuild = 0
    public size = 0
    public priceStorage = 0

    constructor(
        public dialogRef: MatDialogRef<EstimateCostModal>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            const b = data['build']
            this.tasks = b['quantity_merges'] + b['quantity_blends'] + b['quantity_publish']
            this.items = b['collection_items_irregular'] + b['collection_items']
            this.assets = b['quantity_merges'] + (2 * b['quantity_blends'])
            this.priceBuild = (b['price_merges'] + b['price_blends'] + b['price_publish']).toFixed(2)

            const s = data['storage']
            this.size = (s['size_cubes'] + s['size_irregular_cube']).toFixed(2)
            this.priceStorage = (s['price_cubes'] + s['price_irregular_cube']).toFixed(2)
        }

    close(): void {
        this.dialogRef.close()
    }
}