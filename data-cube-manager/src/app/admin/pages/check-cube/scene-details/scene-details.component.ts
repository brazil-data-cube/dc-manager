import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-scene-details',
  templateUrl: './scene-details.component.html',
  styleUrls: ['./scene-details.component.scss']
})
export class SceneDetailsComponent implements OnInit {

  merges = {} as any
  isIrregular: boolean = false
  item_date: string

  constructor(
    public dialogRef: MatDialogRef<SceneDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.merges = this.data.merges
    const { cube, itemDate } = this.data

    if (cube && cube.split('_').length === 2) {
      this.isIrregular = true
      this.merges = { [itemDate]: this.merges[itemDate] }
    }
  }

  getMergeDates() {
    return Object.keys(this.merges)
  }

  getBands(date) {
    const bands = Object.keys(this.merges[date]['bands']) as string[]
    return bands
  }

  countErrors(date) {
    return this.merges[date]['errors'].length
  }

  getImagesFromMerge(date) {
    const bands = this.getBands(date)
    return this.merges[date]['bands'][bands[0]]
  }

  getMergeFile(date) {
    const bands = this.getBands(date)
    const mergeAssets = this.merges[date]['bands'][bands[0]]
    let qk = '';
    if (window['__env'].environmentVersion === 'cloud') {
      qk = mergeAssets['merge'].replace('s3://', '').replace('.tif', '.png').replace(`_${bands[0]}`, '')
      const bucket = qk.split('/')[0]
      return `https://${bucket}.s3.amazonaws.com${qk.replace(bucket, '')}`

    } else {
      qk = mergeAssets[0].replace('.tif', '.png').replace(`_${bands[0]}`, '')
      return qk
    }
  }

  getScenePath(file) {
    const parts = file.split('/')
    const partsSceneID = parts[parts.length - 1].split('_')
    const band = partsSceneID[partsSceneID.length - 1].replace('.tif', '')
    return file.replace(`_${band}.tif`, '')
  }

  close() {
    this.dialogRef.close()
  }

}
