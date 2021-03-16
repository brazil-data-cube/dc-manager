import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminState } from 'app/admin/admin.state';
import { Store, select } from '@ngrx/store';
import { setMetadata } from 'app/admin/admin.action';

const DEFAULT_PARAMETERS = {
    "mask": {
        "clear_data": [],
        "not_clear_data": [],
        "nodata": 0
    }
}

@Component({
  selector: 'app-create-cube-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class CreateCubeMetadataComponent implements OnInit {

  public formMetadataCube: FormGroup
  public definitionCompleted: boolean
  private cubeParameters_: any

  constructor(
    private store: Store<AdminState>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder) {
    this.formMetadataCube = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      license: [''],
      satellite: ['', [Validators.required]],
      instruments: ['', [Validators.required]],
      description: [''],
      parameters: ['', [Validators.required]],
      // additional: ['']
    });

    this.cubeParameters = JSON.stringify(DEFAULT_PARAMETERS, null, 4)

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.definitionInfos && res.definitionInfos.resolution) {
        this.definitionCompleted = true
      }
      if (res.satellite) {
        this.formMetadataCube.get('satellite').setValue(res.satellite)
      }
    })
  }

  get cubeParameters () {
    return JSON.stringify(this.cubeParameters_, null, 4);
  }

  set cubeParameters (v) {
    try{
      this.cubeParameters_ = JSON.parse(v);
    }
    catch(e) {};
  }

  ngOnInit() {
    this.definitionCompleted = false
  }

  private isValidParameters() {
    const obj = JSON.parse(this.cubeParameters);

    return obj.mask && obj.mask.clear_data
  }

  saveInfosInStore() {
    if (!this.isValidParameters()) {
      this.snackBar.open('The cube parameters seems invalid. Mask is required.', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
      return;
    }

    this.formMetadataCube.patchValue({parameters: JSON.parse(this.cubeParameters)})

    if (this.formMetadataCube.status !== 'VALID') {
      this.snackBar.open('Fill in all fields correctly', '', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: 'app_snack-bar-error'
      });
    } else {
      this.store.dispatch(setMetadata({
        metadata: {
          title: this.formMetadataCube.get('title').value,
          license: this.formMetadataCube.get('license').value,
          description: this.formMetadataCube.get('description').value,
          satellite: this.formMetadataCube.get('satellite').value,
          instruments: this.formMetadataCube.get('instruments').value,
          parameters: this.formMetadataCube.get('parameters').value
          // additional: this.formMetadataCube.get('additional').value
        }
      }))
    }
  }
}
