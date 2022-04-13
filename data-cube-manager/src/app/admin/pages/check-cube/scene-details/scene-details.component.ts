import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-scene-details',
  templateUrl: './scene-details.component.html',
  styleUrls: ['./scene-details.component.scss']
})
export class SceneDetailsComponent implements OnInit {

  merges = {} as any
  isIrregular: boolean = false
  item_date: string
  itemId: string

  constructor(
    public dialogRef: MatDialogRef<SceneDetailsComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.merges = this.data.merges
    const { cube, itemDate, itemId } = this.data

    this.itemId = itemId;
    const mergeDate = itemDate.substring(0, 10);

    if (cube && cube.split('_').length === 2) {
      this.isIrregular = true;
      this.merges = { [mergeDate]: this.merges[mergeDate] }
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
      const file = this.merges[date].file;
      if (!file) {
          return '';
      }
      qk = file.replace('.tif', '.png')
      bands.forEach(band => {
        qk = qk.replace(`_${band}`, '')
      })

      const { itemBaseUrl } = window['__env'];

      let newPath = null;

      // TODO: Get absolute path from remote server
      if (qk.startsWith('/gfs/'))
        newPath = qk.substring(4);
      else if (qk.startsWith('/mnt')) {
        const prefix = window['__env'].itemPrefix;

        newPath = `${prefix}${qk.substring(15)}`;
      }
      return `${itemBaseUrl}${newPath}`;
    }
  }

  getScenePath(file, keepOriginal = false) {
    const parts = file.split('/')

    if (file.includes('.SAFE') && !keepOriginal) {
      const safeFolderPos = file.indexOf('.SAFE') + 5;
      const safeFolder = file.substring(0, safeFolderPos);
      const safeParts = safeFolder.split('/');
      const sceneId = safeParts[safeParts.length - 2];
      const sceneIdPath = file.substring(0, safeFolderPos - 66);

      return `${sceneIdPath}/${sceneId}.png`
    }

    const partsSceneID = parts[parts.length - 1].split('_')
    const band = partsSceneID[partsSceneID.length - 1].replace('.tif', '')
    return file.replace(`_${band}.tif`, '.png')
  }

  close() {
    this.dialogRef.close()
  }

  exportSceneIds() {
    const scenes = [];
    for(let mergeDate of Object.keys(this.merges)) {
      const merge = this.merges[mergeDate];
      for (let error of merge['errors']) {
        scenes.push(error['filename']);
      }
    }

    return this.exportJSONFile(scenes);
  }

  exportMergesURL() {
    return this.exportJSONFile(this.merges);
  }

  private exportJSONFile(data) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' })

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

}
