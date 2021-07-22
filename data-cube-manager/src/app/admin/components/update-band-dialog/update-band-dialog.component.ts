import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { closeLoading, showLoading } from 'app/app.action';
import { AppState } from 'app/app.state';


@Component({
  selector: 'app-update-band-dialog',
  templateUrl: './update-band-dialog.component.html',
  styleUrls: ['./update-band-dialog.component.css']
})
export class UpdateBandDialogComponent implements OnInit {
  public form: FormGroup;
  public metadata_: string;
  public band: any;
  public cube: any;
  public dataTypes: string[] = [
    'uint8',
    'int16',
    'uint16',
    'int32',
    'uint32',
    'float32',
    'float64'
  ]

  constructor(
    public dialogRef: MatDialogRef<UpdateBandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: CubeBuilderService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {
    this.band = data.band;
    this.cube = data.cube;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [[''], [Validators.required]],
      common_name: [[''], [Validators.required]],
      nodata: [[''], [Validators.required]],
      scale: [[''], [Validators.required]],
      data_type: [[''], [Validators.required]],
      description: [[''], []],
    });

    this.metadata_ = this.band._metadata;

    this.form.patchValue(this.band);
  }

  get metadata() {
    return JSON.stringify(this.metadata_, null, 4);
  }

  set metadata(meta) {
    try {
      this.metadata_ = JSON.parse(meta);
    } catch (e) { }
  }

  close(status = false) {
    this.dialogRef.close(status);
  }

  async update() {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(showLoading());

    const formData = { ...this.form.value, id: this.band.id, collection_id: this.band.collection_id };
    formData._metadata = this.metadata_;

    const data = { bands: [ formData ] };

    try {
      await this.service.update(this.cube['id'], data);

      this.snackBar.open('Band has been successfully.', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-success'
      });

      this.close(true);

    } catch (err) {
      let message = err.error;

      if (err.status === 0) {
        message = 'Server error. Please contact the system administrator';
      }

      this.snackBar.open(JSON.stringify(message), '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
      });
    } finally {
      this.store.dispatch(closeLoading());
    }
  }
}
