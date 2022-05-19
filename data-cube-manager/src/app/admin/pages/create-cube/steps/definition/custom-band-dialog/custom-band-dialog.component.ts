import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-band-dialog',
  templateUrl: './custom-band-dialog.component.html',
  styleUrls: ['./custom-band-dialog.component.css']
})
export class CustomBandDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<CustomBandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  onClose() {
    this.dialogRef.close(this.data.band ? this.data.band.toUpperCase() : this.data.band)
  }

}
