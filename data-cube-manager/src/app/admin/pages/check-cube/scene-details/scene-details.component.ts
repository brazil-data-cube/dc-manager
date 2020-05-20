import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-scene-details',
  templateUrl: './scene-details.component.html',
  styleUrls: ['./scene-details.component.css']
})
export class SceneDetailsComponent implements OnInit {

  merges = {} as any;
  isIrregular: boolean = false;
  item_date: string;

  constructor(
    public dialogRef: MatDialogRef<SceneDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.merges = this.data.merges;
    const { cube, itemDate } = this.data;

    if (cube && cube.split('_').length === 2) {
      this.isIrregular = true;

      this.merges = { [itemDate]: this.merges[itemDate] };
    }

    console.log('DATA ->', this.data)
  }

  getMergeDates() {
    return Object.keys(this.merges);
  }

  getBands(date) {
    const bands = Object.keys(this.merges[date]['bands']) as string[];
    return bands;
  }

  countErrors(date) {
    return this.merges[date]['errors'].length;
  }

  getImagesFromMerge(date) {
    const bands = this.getBands(date);

    return this.merges[date]['bands'][bands[0]]['scenes'];
  }

  getMergeFile(date) {
    const bands = this.getBands(date);
    const mergeAssets = this.merges[date]['bands'][bands[0]];

    return mergeAssets['merge'];
  }

  close() {
    this.dialogRef.close()
  }

}
