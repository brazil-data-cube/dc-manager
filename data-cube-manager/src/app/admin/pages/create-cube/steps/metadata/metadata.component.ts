import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminState } from 'app/admin/admin.state';
import { Store, select } from '@ngrx/store';
import { setMetadata } from 'app/admin/admin.action';

@Component({
  selector: 'app-create-cube-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class CreateCubeMetadataComponent implements OnInit {

  public formMetadataCube: FormGroup
  public definitionCompleted: boolean

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
      // additional: ['']
    });

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.definitionInfos && res.definitionInfos.resolution) {
        this.definitionCompleted = true
      }
      if (res.satellite) {
        this.formMetadataCube.get('satellite').setValue(res.satellite)
      }
    })
  }

  ngOnInit() {
    this.definitionCompleted = false
  }

  saveInfosInStore() {
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
          // additional: this.formMetadataCube.get('additional').value
        }
      }))
    }
  }
}
